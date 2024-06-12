import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../assets/css/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faFile } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import HtmlDocx from 'html-docx-js/dist/html-docx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSE } from '../common/CSE';
require('dotenv').config();

function WorkPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const selectRef = useRef(null);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const bottomRef = useRef(null);
  const userId = localStorage.getItem('userid');
  const [userSettings, setUserSettings] = useState({
    tone: 'professional',
    bodyOfLaw: ['Federal USA'],
    language: 'English',
    shortMode: true
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        let response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/getSettings`, { token });
        if (response.message === `You're logged out. Please login again`) {
          localStorage.removeItem('token');
        }
        setUserSettings(response.data.settings);
      } catch (error) {
        if (error.response.data.message === `You're logged out. Please login again`) {
          localStorage.removeItem("token");
        }
        toast.error(error.response ? error.response.data.message : 'Error getting data');
      }
    };

    const fetchFiles = async () => {
      try {
        let response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/get-all-files`, { token });
        setFiles(response.data.files);
      } catch (error) {
        toast.error('Error fetching files');
      }
    };

    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-chat/${userId}`);
        if (response.data.success) {
          setMessages(response.data.messages);
        } else {
          console.log(response.data.message);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
    };

    fetchChatHistory();
    fetchFiles();
    fetchUserSettings();
  }, [token, userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bottomRef.current) {
        const scrollContainer = bottomRef.current.parentNode;
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, 100);
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    return () => clearTimeout(timer);
  }, [messages]);

  const handleFileChange = async (event) => {
    let fileId = event.target.value;
    setSelectedFile(fileId);
    if (!fileId) {
      setInput('');
      return;
    }
    try {
      let response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/readFile/${fileId}`);
      setInput(response.data.content);
    } catch (error) {
      toast.error('Error reading file');
    }
  };

  const handleIconClick = () => {
    if (selectRef.current) {
      selectRef.current.click();
    }
  };

  const logTokenUsage = async (tokensUsed) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_FRONTEND_URL}/log-token-usage`, {
        token,
        tokensUsed,
      });
      console.log('Token usage logged:', response.data);
    } catch (error) {
      console.error('Error logging token usage:', error);
    }
  };

  const getAIResponse = async (prompt, maxTokens, targetLength) => {
    setIsLoading(true);

    const settingsSentence = `You are a ${userSettings.tone} lawyer who knows the law of ${userSettings.bodyOfLaw.join(', ')} and writes in ${userSettings.language}.`;

    try {
      if (userSettings.shortMode) {
        let externalInfoTexts = [];
        for (let country of userSettings.bodyOfLaw) {
          let externalInfoResponse = await axios.get(
            `https://www.googleapis.com/customsearch/v1?q=${prompt}&key=${process.env.REACT_APP_GOOGLE_API_KEY}&cx=${CSE[country] || CSE.Other}`
          );
          let externalInfoText = externalInfoResponse.data.items.map(item => item.snippet).join("\n");
          externalInfoTexts.push(externalInfoText);
        }
        let combinedExternalInfoText = externalInfoTexts.join("\n");

        let shortResponse = await axios.post(
          `https://api.openai.com/v1/chat/completions`,
          {
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: `${prompt}\n\n${settingsSentence}\n\nIncorporate the following external information into the response:\n${combinedExternalInfoText}\n\nPlease provide a concise response with key points in less than 1000 tokens.` }
            ],
            max_tokens: 1000,
            n: 1,
            stop: null
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        let shortAnswer = shortResponse.data.choices[0].message.content;
        setMessages(prevMessages => [...prevMessages, { text: shortAnswer, type: 'ai' }]);
        setIsLoading(false);

        await logTokenUsage(1000);

        return shortAnswer;
      }

      let totalTokensUsed = 0;

      let outlineResponse = await axios.post(
        `https://api.openai.com/v1/chat/completions`,
        {
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `${prompt}\n\n${settingsSentence}\n\nCreate a detailed and structured bullet-point outline for a ${targetLength}-page document based on the above text. Ensure the outline includes specific sections and subsections with key facts and points to address each argument and point chronologically. Use the headers exactly as specified in the outline and do not add any new headers or sections.` }
          ],
          max_tokens: 4096,
          n: 1,
          stop: null
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let outline = outlineResponse.data.choices[0].message.content;
      console.log("Generated Outline:\n", outline);
      totalTokensUsed += outlineResponse.data.usage.total_tokens;

      let documentText = "";
      let sections = outline.split("\n\n");
      let tokensPerSection = (targetLength * 1000) / sections.length;

      for (let section of sections) {
        let sectionText = "";
        let sectionRemainingTokens = tokensPerSection;

        while (sectionRemainingTokens > 0) {
          let externalInfoTexts = [];
          for (let country of userSettings.bodyOfLaw) {
            let externalInfoResponse = await axios.get(
              `https://www.googleapis.com/customsearch/v1?q=${section}&key=${process.env.REACT_APP_GOOGLE_API_KEY}&cx=${CSE[country] || CSE.Other}`
            );

            let externalInfoText = externalInfoResponse.data.items.map(item => item.snippet).join("\n");
            externalInfoTexts.push(externalInfoText);
          }

          let combinedExternalInfoText = externalInfoTexts.join("\n");
          let sectionPrompt = `${settingsSentence}\n\n${section}\n\nKeep the following outline section as the headings structure, and expand the outline section into coherent detailed paragraphs without adding new headers or sections. Focus only on this section and do not conclude or summarize:\n\n${section}\n\nProvide in-depth legal reasoning. Discuss, relate, and compare the facts of the case to the applicable law of the jurisdiction and to the facts of the relevant case law. Use detailed comparisons and analyses. Quote statutes and case law extensively to support the argumentation. Write clearly. Use the active voice. Use advanced legal terminology and plain anglo-saxon words. Put statements in positive form. Use definite, specific, and concrete language. Omit needless words. Avoid a succession of loose sentences. Express coordinate ideas in similar form. Keep related words together. In summaries, keep to one tense. Place the emphatic words of a sentence at the end. Use official legal blue book style citations.\n\nExternal Information:\n${combinedExternalInfoText}`;

          let fillResponse = await axios.post(
            `https://api.openai.com/v1/chat/completions`,
            {
              model: "gpt-4o",
              messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: sectionPrompt }
              ],
              max_tokens: Math.min(sectionRemainingTokens, 4000),
              n: 1,
              stop: null
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );

          let generatedText = fillResponse.data.choices[0].message.content;
          sectionText += generatedText;
          sectionRemainingTokens -= generatedText.split(" ").length;
          console.log(`Generated text for section ${section}: ${generatedText}`);
          totalTokensUsed += fillResponse.data.usage.total_tokens;
        }

        documentText += sectionText;
      }

      let postProcessResponse = await axios.post(
        `https://api.openai.com/v1/chat/completions`,
        {
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `${settingsSentence}\n\n${documentText}\n\nReview the following text for coherence and flow within the context of the outline section. Ensure it reads smoothly as a single, continuous document. Do not change the content or meaning. Correct any repetitive phrases or redundant conclusions.` }
          ],
          max_tokens: 4000,
          n: 1,
          stop: null
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let finalDocument = postProcessResponse.data.choices[0].message.content;
      console.log("Final Document:", finalDocument);
      totalTokensUsed += postProcessResponse.data.usage.total_tokens;

      await logTokenUsage(totalTokensUsed);

      setMessages(prevMessages => [...prevMessages, { text: finalDocument, type: 'ai' }]);
      return finalDocument;
    } catch (error) {
      console.error('Error in API call:', error);
      toast.error('Error in API call');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (userPrompt, typ) => {
    const newMessage = { text: userPrompt, type: typ };
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/save-chat`, { userId, newMessage });
      console.log(response);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    setInput('');

    let prompt = input;

    let pageCountMatch = prompt.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand) page(s?)/i);
    let targetLength = 20;

    if (pageCountMatch) {
      let pageCountText = pageCountMatch[1];
      targetLength = pageCountText.match(/\d+/) ? parseInt(pageCountText) : textualToNumeric(pageCountText);
    }

    let userPrompt = `${prompt}\n\nYou are a ${userSettings.tone} lawyer who knows the law of ${userSettings.bodyOfLaw.join(', ')} and speaks only ${userSettings?.defaultLanguage ? userSettings.defaultLanguage : userSettings.language}.`;
    setMessages([...messages, { text: input, type: 'user' }]);
    handleSendMessage(prompt, 'user');

    let aiResponse = await getAIResponse(userPrompt, 4096, targetLength);

    if (aiResponse && aiResponse.trim() !== '') {
      aiResponse = aiResponse.replace(/\n/g, '<br>');
      aiResponse = aiResponse.replace(/  +/g, ' &nbsp;');

      const doc = HtmlDocx.asBlob(`<html><body>${aiResponse}</body></html>`);
      const docUrl = URL.createObjectURL(doc);
      const downloadLink = document.createElement('a');

      downloadLink.href = docUrl;
      downloadLink.download = 'generated_document.docx';

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      console.log('Word document generated successfully!');
    }

    handleSendMessage(aiResponse, 'ai');
  };

  function textualToNumeric(textualNumber) {
    let numberMap = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
      sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
      thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
      eighty: 80, ninety: 90, hundred: 100, thousand: 1000
    };
    return textualNumber.split(/\s+/).reduce((acc, word) => acc + (numberMap[word] || 0), 0);
  }

  return (
    <div className="work-page">
      <ToastContainer />
      <h1>Generate Documents with AI</h1>
      <div className="chat-interface">
        <div className="output-container" id="output-field">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <p className="message-content">{message.text}</p>
            </div>
          ))}
          {isLoading && <div>Generating Response...</div>}
          <div ref={bottomRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            id="input-box"
            placeholder="Ask Whiteshoe AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          />
          <div className="file-selector">
            <Button className="file-select" variant="primary" style={{ width: '50px', borderRadius: '20%' }} onClick={handleShow}>
              <FontAwesomeIcon icon={faFile} onClick={handleIconClick} className="dropdown-icon" />
            </Button>
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Select A File</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {files.length > 0 ? (
                  <select ref={selectRef} value={selectedFile} onChange={handleFileChange} className="form-control">
                    <option value=''>Select a file!</option>
                    {files.map(file => (
                      <option key={file._id} value={file.filename}>{file.filename}</option>
                    ))}
                  </select>
                ) : (
                  <p>No files available</p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
          <button id="submit-btn" onClick={handleSubmit}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkPage;
