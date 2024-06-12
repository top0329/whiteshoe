import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import { CSE } from '../common/CSE';
import ReactLoading from 'react-loading';
import whiteDocIcon from '../../assets/img/whitedoc.svg';
import blackDocIcon from '../../assets/img/blackdoc.svg';
import '../../assets/css/styles.css';

// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_TEST_KEY);

function Home() {
  const [ragInput, setRagInput] = useState('');
  const [ragOutput, setRagOutput] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [ipAddress, setIpAddress] = useState('')
  const [selectedDemo, setSelectedDemo] = useState('');
  const [demoContent, setDemoContent] = useState('');
  const [tone, setTone] = useState('');
  const [bodyOfLaw, setBodyOfLaw] = useState('');
  const [language, setLanguage] = useState('');
  const [isShortLoading, setIsShortLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);
  const [reviews, setReviews] = useState([]);
  const maxUsage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    // Connect to MongoDB
    const connectToMongoDB = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/test-db`);
        if (response.ok) {
          const data = await response.json();
          console.log('Connected to MongoDB:', data.users);
        } else {
          console.error('Failed to connect to MongoDB:', response.status);
        }
      } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
      }
    };

    // Connect to backend node app
    const connectToBackend = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/test`);
        if (response.ok) {
          console.log('Connected to backend node app');
        } else {
          console.error('Failed to connect to backend node app:', response.status);
        }
      } catch (error) {
        console.error('Failed to connect to backend node app:', error);
      }
    };

    connectToMongoDB();
    connectToBackend();
  }, []);

  // useEffect(() => {
  //   if (textRef.current) {
  //     textRef.current.innerHTML = displayedText.replace(/\n/g, '<br/><br/>');
  //   }
  // }, [displayedText]);

  useEffect(() => {
    const fetchIpAndUsage = async () => {
      try {
        // Fetch IP and usage data from the backend
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/get-ip`);
        console.log('API Response:', response.data);

        // Check if the response contains the usageCount and update the state
        if (response.data && response.data.usageCount !== undefined && response.data.ipAddress !== undefined) {
          setIpAddress(response.data.ipAddress);
          setUsageCount(response.data.usageCount);
        } else {
          console.error('Invalid response data:', response.data);
        }
      } catch (error) {
        console.error('Error fetching IP and usage:', error);
      }
    };

    fetchIpAndUsage();
  }, []);


  const handleRagInputChange = (e) => {
    setRagInput(e.target.value);
  };

  const handleRagSubmit = async (e) => {
    e.preventDefault();
    if (usageCount >= maxUsage) {
      alert('You have reached the maximum number of uses.');
      return;
    }

    setIsShortLoading(true);

    try {
      let externalInfoTexts = [];
      for (let country of bodyOfLaw) {
        let externalInfoResponse = await axios.get(
          `https://www.googleapis.com/customsearch/v1?q=${ragInput}&key=${process.env.GOOGLE_API_KEY}&cx=${CSE[country] || CSE.Other}`
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
            { role: "user", content: `${ragInput}\n\nYou are a ${tone} lawyer who knows the law of ${bodyOfLaw} and writes in ${language}.\n\nIncorporate the following external information into the response:\n${combinedExternalInfoText}\n\nPlease provide a concise response with key points in less than 1000 tokens.` }
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
      setRagOutput(shortAnswer);
      setIsShortLoading(false);

      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/increment-usage`, { ip: ipAddress });

    } catch (error) {
      console.error('Error generating RAG output:', error);
      alert('Error generating output. Please try again later.');
      setIsShortLoading(false);
    } finally {
      setUsageCount(usageCount + 1);
    }
  };

  const parseMarkdown = (text) => {
    text = text.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    text = text.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    text = text.replace(/\[([^[\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/^ (.*$)/gim, '<blockquote>$1</blockquote>');
    text = text.replace(/```\n([\s\S]*?)\n```/gim, '<pre><code>$1</code></pre>');
    text = text.replace(/`([^`]+)`/gim, '<code>$1</code>');
    text = text.replace(/\n/g, '<br/>');
    return text.trim();
  };

  const handleDemoChange = async (e) => {
    const selectedDemo = e.target.value;
    setSelectedDemo(selectedDemo);

    if (selectedDemo) {
      try {
        const response = await fetch(`/demo-documents/${selectedDemo}.txt`);
        const text = await response.text();
        const htmlContent = parseMarkdown(text);
        setDemoContent(htmlContent);
      } catch (error) {
        console.error('Error loading demo document:', error);
        setDemoContent('Error loading demo document.');
      }
    } else {
      setDemoContent('');
    }
  };

  const handleSubscribe = async (plan) => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/create-checkout-session`,
        { plan, token: localStorage.getItem('token') },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      // const stripe = await stripePromise;
      // const { error } = await stripe.redirectToCheckout({ sessionId: response.data.session.id });

      // if (error) {
      //   toast.error(error.message);
      // } else {
      //   toast.success('Redirecting to checkout...');
      // }
    } catch (error) {
      console.error('Error creating checkout session:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error(error.response ? error.response.data.message : 'Error creating checkout session');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextReview = () => {
    setCurrentReview((prevReview) => (prevReview + 1) % reviews.length);
  };

  const handlePrevReview = () => {
    setCurrentReview((prevReview) => (prevReview - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    setReviews([
      {
        name: "Iva",
        title: "Commercial Attorney",
        text: "Useful platform for drafting briefs and responses to appeals that are rich in references to statutory provisions and case law. The structure of submissions is very transparent. Each submission, regardless of the content, begins with an overview of the context and content of the previously loaded document, so that the user is already familiar with whether the legal reasoning method has been correctly applied and was the document correctly interpreted, which was the case with mine. I noticed the potential of the platform due to the clear connection of legal concepts, which resulted in the fact that the comparative legal analysis in the submissions was carried out without error, within the framework of the requirements, that is, within the framework of the legal areas that I had previously assigned. The briefs are wordy, legal terms are used clearly, and the party's request is highlighted in the right place within the brief itself. There is an evidence citated for every conclusion in the brief.",
        photo: "/assets/iva.png"
      },
      {
        name: "Ognjen",
        title: "Legal Assistant",
        text: "Useful platform for drafting briefs and responses to appeals that are rich in references to statutory provisions and case law. The structure of submissions is very transparent. Each submission, regardless of the content, begins with an overview of the context and content of the previously loaded document, so that the user is already familiar with whether the legal reasoning method has been correctly applied and was the document correctly interpreted, which was the case with mine. I noticed the potential of the platform due to the clear connection of legal concepts, which resulted in the fact that the comparative legal analysis in the submissions was carried out without error, within the framework of the requirements, that is, within the framework of the legal areas that I had previously assigned. The briefs are wordy, legal terms are used clearly, and the party's request is highlighted in the right place within the brief itself. There is an evidence citated for every conclusion in the brief.",
        photo: "/assets/ognjen.png"
      },
      {
        name: "Zeynap",
        title: "Commercial Attorney",
        text: "I have found this tool to be incredibly valuable for my legal tasks. It seamlessly integrates document review, including complaints and appeals, and offers optimal strategies for specific cases. Moreover, it efficiently identifies relevant cases and precedents, significantly reducing workload. All information is meticulously cited from reliable sources and contains high-quality legal reasoning. Consequently, some sections of the response can be directly integrated into work, while others provide a robust foundation for further development. I have found this tool to be incredibly valuable for my legal tasks. It seamlessly integrates document review, including complaints and appeals, and offers optimal strategies for specific cases. Moreover, it efficiently identifies relevant cases and precedents, significantly reducing workload. All information is meticulously cited from reliable sources and contains high-quality legal reasoning. Consequently, some sections of the response can be directly integrated into work, while others provide a robust foundation for further development. This tool acts as a substitute for a paralegal with comprehensive case knowledge and strong reasoning skills, making it an ideal assistant for any lawyer. I personally commend the quality of the AI's output and the promptness of responses. It accomplishes in minutes what could take hours or days for even the most experienced lawyers.",
        photo: "/assets/zeynap.png"
      }
    ]);
  }, []);

  return (
    <div className="content-wrapper">
      <main className="main">
        {/* <div className="centered-text">
          <div ref={textRef} className="user-input-editable centered-text" style={{ whiteSpace: 'pre-wrap' }}></div>
        </div> */}
        <div className="flex-container">
          <div className="flex-item grey-box">
            <h3 className="centered-title">Short Mode</h3>
            <p className="centered-text">This is a short response chat interface--GPT4o with specialized RAG integration for your jurisdiction. In other words it is like chat gpt but with access to specialized legal databases for specific jurisdictions.</p>
            <div className="rag-short-mode">
              <form onSubmit={handleRagSubmit}>
                <div className="form-group horizontal-group">
                  <label htmlFor="tone">Select Tone:</label>
                  <select className='select-tone' id="tone" value={tone} placeholder='Select Tone' onChange={(e) => setTone(e.target.value)} required>
                    <option value="" disabled hidden>
                      Select Tone
                    </option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="authoritative">Authoritative</option>
                  </select>
                  <label htmlFor="bodyOfLaw">Select Body of Law:</label>
                  <select className='select-law' id="bodyOfLaw" value={bodyOfLaw} onChange={(e) => setBodyOfLaw(e.target.value)} required>
                    <option value="" disabled hidden>Select Body of Law</option>
                    {Object.keys(CSE).map((key) => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                  <label htmlFor="language">Select Language:</label>
                  <select className='select-language' id="language" value={language} onChange={(e) => setLanguage(e.target.value)} required>
                    <option value="" disabled hidden>Select Language</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh-CN">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="rag-input">Enter your query:</label>
                  <textarea id="rag-input" name="rag-input" value={ragInput} onChange={handleRagInputChange} required></textarea>
                  <button type="submit" disabled={isLoading || usageCount >= maxUsage} className="arrow-button">→</button>
                </div>
              </form>
              <div className='rag-output'>
                {isShortLoading ? <ReactLoading type={'spin'} color={'#000000'} height={64} width={64} /> : ragOutput && (
                  <div >
                    <h4>Output:</h4>
                    <p style={{ textAlign: 'justify' }}>{ragOutput}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
          <div className="flex-item grey-box">
            <h3 className="centered-title">Long Mode</h3>
            <p className="centered-text">This is complete long document generation with downloads to your machine--GPT4o with specialized RAG integration for your jurisdiction. These are competent, well organized, complete documents of the length specified in the prompt. For example, "Write a 20 page response to this complaint. Ms. X was unaware of the wrongful actions and etc. etc. etc." In long mode, Whiteshoe will download a well organized 20 page response with specific facts woven into jurisdiction-specific legal reasoning.</p>
            <div className="process-graphic">
              <div className="icon-with-text">
                <img src={whiteDocIcon} alt="White Document Icon" />
                <p className="document-text">Upload Files</p>
              </div>
              <div className="arrow-and-text">
                <div className="arrow">→</div>
                <p className="arrow-text">"Write a memo/brief/answer/complaint, based on the file."</p>
              </div>
              <div className="icon-with-text">
                <img src={blackDocIcon} alt="Black Document Icon" />
                <p className="document-text">Output Download</p>
              </div>
            </div>
            <div className="demo-documents">
              <select value={selectedDemo} onChange={handleDemoChange} className="demo-select">
                <option value="">View a demo</option>
                <option value="alaska_answer">Alaska Answer (English)</option>
                <option value="Trump_Answer">New York Answer Donald Trump (English)</option>
                <option value="Jarkesy_Brief">SCOTUS Brief SEC (English)</option>
                <option value="Heard_Answer">Virginia Answer Amber Heard (English)</option>
                <option value="Castillo_Peru">Peru Brief Pedro Castillo (Spanish)</option>
                <option value="argentina_answer">Argentina Answer (Spanish)</option>
                <option value="colombia_intergovernment">Colombia Intergovernment Memo (Spanish)</option>
                <option value="turkish_securities">Turkish Securities Memo (Turkish)</option>
              </select>
              {demoContent && (
                <div className="scrollable-box" dangerouslySetInnerHTML={{ __html: demoContent }}></div>
              )}
            </div>
          </div>
        </div>
        <div className="pricing-functionality">
          <h3>Whiteshoe Work</h3>
          <div className="pricing-options">
            <div className="pricing-option">
              <h4>Free</h4>
              <ul>
                <li>Short mode only</li>
                <li>Generate up to 10 pages</li>
              </ul>
              <button onClick={() => handleSubscribe('free')} className="signup-button">Sign up</button>
            </div>
            <div className="pricing-option">
              <h4>Usage</h4>
              <ul>
                <li>No monthly fee</li>
                <li>Full access, no rate limit</li>
                <li>Charges $0.25 per 1000 tokens of output. That means about $1 per 12-16 pages of output.</li>
              </ul>
              <button onClick={() => handleSubscribe('usage')} className="signup-button">Sign up</button>
            </div>
            <div className="pricing-option">
              <h4>Subscription</h4>
              <ul>
                <li>$50 monthly fee</li>
                <li>Full access, no rate limit</li>
                <li>Charges $0.10 per 1000 tokens. That means about $1 per 30-40 pages of output.</li>
              </ul>
              <button onClick={() => handleSubscribe('member')} className="signup-button">Sign up</button>
            </div>
          </div>
        </div>
        <div className="review-section">
          <h3>Lawyers Review Whiteshoe Reasoning</h3>
          <div className="review-container">
            <button className="prev-button" onClick={handlePrevReview}>←</button>
            <div className="review-content">
              <div className="review-details">
                {reviews.length > 0 && (
                  <>
                    <img src={reviews[currentReview].photo} alt={reviews[currentReview].name} className="review-photo" />
                    <div className="review-text">
                      <h4>{reviews[currentReview].name}</h4>
                      <p className="review-job-title">{reviews[currentReview].title}</p>
                    </div>
                    <p className="review-comments">{reviews[currentReview].text}</p>
                  </>
                )}
              </div>
            </div>
            <button className="next-button" onClick={handleNextReview}>→</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
