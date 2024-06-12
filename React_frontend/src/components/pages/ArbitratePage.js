import React, { useState, useRef } from 'react';
import '../../assets/css/styles.css';

const Arbitrate = () => {
  const [selectedClause, setSelectedClause] = useState('standard');
  const clauseRef = useRef(null);

  const rulesFiles = [
    { name: 'Rules and Procedures', path: '/WS_content/WHITESHOE_RULES.pdf' },
    { name: 'Rules (English)', path: '/WS_content/WHITESHOE_RULES.pdf' },
    { name: '規則 (Traditional Chinese)', path: '/WS_content/WHITESHOE_RULES_TZH.pdf' },
    { name: '规则 (Simplified Chinese)', path: '/WS_content/WHITESHOE_CONDUCT_SZH.pdf' },
    { name: 'ルール (Japanese)', path: '/WS_content/WHITESHOE_RULES_JA.pdf' },
    { name: '규칙 (Korean)', path: '/WS_content/WHITESHOE_RULES_KO.pdf' },
    { name: 'नियम (Hindi)', path: '/WS_content/WHITESHOE_RULES_HI.pdf' },
    { name: 'قواعد (Arabic)', path: '/WS_content/WHITESHOE_RULES_AR.pdf' },
    { name: 'Kurallar (Turkish)', path: '/WS_content/WHITESHOE_RULES_TR.pdf' },
    { name: 'Règles (French)', path: '/WS_content/WHITESHOE_RULES_FR.pdf' },
    { name: 'Reglas (Spanish)', path: '/WS_content/WHITESHOE_RULES_ES.pdf' },
    { name: 'Kamachikuykuna (Quechua) ', path: '/WS_content/WHITESHOE_RULES_QU.pdf' },
    { name: 'Regras (Portugese)', path: '/WS_content/WHITESHOE_RULES_PT.pdf' },
    { name: 'Regeln (German)', path: '/WS_content/WHITESHOE_RULES_DE.pdf' },
    { name: 'Regole (Italian)', path: '/WS_content/WHITESHOE_RULES_IT.pdf' },
    { name: 'Zasady (Polish)', path: '/WS_content/WHITESHOE_RULES_PL.pdf' },
    { name: 'Szabályok (Hungarian)', path: '/WS_content/WHITESHOE_RULES_HU.pdf' },
    { name: 'Правила (Russian)', path: '/WS_content/WHITESHOE_RULES_RU.pdf' },
    { name: 'Правила (Ukrainian) ', path: '/WS_content/WHITESHOE_RULES_UK.pdf' },
  ];

  const otherDocsFiles = [
    { name: 'Fee Schedule', path: '/WS_content/WS_FEE_SCHEDULE.pdf' },
    { name: 'File a Claim', path: '/WS_content/fileclaim.pdf' },
    { name: 'Agreement to Arbitrate', path: '/WS_content/agreementtoarbitrate.pdf' },
    { name: 'Standards of Conduct', path: '/WS_content/WHITESHOE_CONDUCT.pdf' },
  ];

  const clauses = {
    standard: `ARBITRATION CLAUSE. Any dispute, controversy, or claim arising out of or relating to this contract, or the breach, termination, or invalidity thereof, shall be settled by arbitration administered by Whiteshoe Algorithmic Arbitration at www.whiteshoe.net in accordance with its Standard Commercial Arbitration Rules and official policies promulgated by Whiteshoe. The proceedings will be conducted in accordance with these rules and policies, and the outcome shall be binding on the parties and enforceable in any court of law. The question of arbitrability shall be determined solely by Whiteshoe Algorithmic Arbitration. Refusal to participate in the arbitration process will result in a forfeiture of the right to present evidence to the algorithmic process. The parties willingly and knowingly accept that the arbitration analysis will be performed by an artificial intelligence model and accept Whiteshoe sole control over the process of applying the model to the evidence submitted by the parties. If any part of this arbitration agreement is found to be invalid or unenforceable, the remaining parts shall remain in full force and effect.`,
    expedited: `ARBITRATION CLAUSE. Any dispute, controversy, or claim arising out of or relating to this contract, or the breach, termination, or invalidity thereof, shall be settled by arbitration administered by Whiteshoe Algorithmic Arbitration at www.whiteshoe.net in accordance with its Expedited Commercial Arbitration Rules and official policies promulgated by Whiteshoe. The proceedings will be conducted in accordance with these rules and policies, and the outcome shall be binding on the parties and enforceable in any court of law. The parties acknowledge and consent to arbitration without hearings and only pleadings on the accelerated timeline as described in the Rules. The question of arbitrability shall be determined solely by Whiteshoe Algorithmic Arbitration. Refusal to participate in the arbitration process will result in a forfeiture of the right to present evidence to the algorithmic process. The parties willingly and knowingly accept that the arbitration analysis will be performed by an artificial intelligence model and accept Whiteshoe sole control over the process of applying the model to the evidence submitted by the parties. If any part of this arbitration agreement is found to be invalid or unenforceable, the remaining parts shall remain in full force and effect.`,
    largeCommercialDispute: `ARBITRATION CLAUSE. Any dispute, controversy, or claim arising out of or relating to this contract, or the breach, termination, or invalidity thereof, shall be settled by arbitration administered by Whiteshoe Algorithmic Arbitration at www.whiteshoe.net in accordance with its Large Commercial Dispute Commercial Arbitration Rules and official policies promulgated by Whiteshoe. The proceedings will be conducted in accordance with these rules and policies, and the outcome shall be binding on the parties and enforceable in any court of law. The parties intend for the arbitration to proceed under the Large Commercial Dispute Rules, that include the use of a human arbitrator to manage the pleading and hearing process. The parties acknowledge that such human arbitrator will rule on the merits. The question of arbitrability shall be determined solely by Whiteshoe Algorithmic Arbitration. Refusal to participate in the arbitration process will result in a forfeiture of the right to present evidence to the algorithmic process. The parties willingly and knowingly accept that the arbitration analysis will be performed by an artificial intelligence model and accept Whiteshoe sole control over the process of applying the model to the evidence submitted by the parties. If any part of this arbitration agreement is found to be invalid or unenforceable, the remaining parts shall remain in full force and effect.`,
  };

  const copyToClipboard = () => {
    const text = clauseRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard');
    });
  };

  return (
    <div style={{ textAlign: 'center', fontVariant: 'normal' }}>
      <section className="text-section">
        <h1>Arbitrate</h1>
        <p>Whiteshoe Algorithmic Arbitration uses proprietary artificial intelligence models and processes that are specifically designed for legal analysis. We are constantly developing our models as the technology rapidly advances. This sophisticated natural language processing technology enables Whiteshoe to process evidence and issue judgements with unparalleled accuracy and efficiency.</p>
        <p>By specifying "Whiteshoe Algorithmic Arbitration" in contracts, parties can bind themselves to this advanced form of arbitration, ensuring a resolution process that is not only faster but also significantly more cost-effective than traditional methods.</p>
        <p>Whiteshoe Algorithmic Arbitration is particularly appropriate for disputes involving large amounts of data or small disputed amounts. The vastly lower cost of algorithmic arbitration compared to traditional methods enables careful and accurate resolution of small disputes and evidence intensive disputes, without paying for the expensive human processes and weak human computing power of traditional arbitration.</p>
      </section>

      <section className="clause-section" style={{ backgroundColor: '#f2f2f2', padding: '10px', fontSize: '0.9em', marginTop: '20px', position: 'relative' }}>
        <button onClick={copyToClipboard} style={{ position: 'absolute', top: '5px', right: '5px', borderRadius: '50%', padding: '3px 3px' }}>Copy</button>
        <div style={{ marginBottom: '10px' }}>
          <span onClick={() => setSelectedClause('standard')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Standard</span> |
          <span onClick={() => setSelectedClause('expedited')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Expedited</span> |
          <span onClick={() => setSelectedClause('largeCommercialDispute')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Large Commercial Dispute</span>
        </div>
        <div ref={clauseRef} style={{ maxHeight: '150px', overflow: 'auto', fontSize: '0.8em', textTransform: 'none', fontFamily: 'Arial', textAlign: 'left', fontVariant: 'normal' }}>
          {clauses[selectedClause]}
        </div>
      </section>

      <section className="video-section" style={{ maxWidth: '100%', paddingTop: '20px' }}>
        <video src="/WS_arbitrate.mp4" controls style={{ width: '100%', height: '400px' }} />
      </section>

      <section className="forms-documents-section" style={{ marginTop: '20px' }}>
        <h2 style={{ textAlign: 'center' }}>Forms and Documents</h2>
        <div>
          <select className="centered-dropdown" onChange={(e) => {
            const link = document.createElement('a');
            link.href = e.target.value;
            link.download = ''; // This attribute prompts download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <option value="">Select a document</option>
            {rulesFiles.map((file, index) => (
              <option key={index} value={file.path}>
                {file.name}
              </option>
            ))}
          </select>

          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {otherDocsFiles.map((file, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <a href={file.path} download>
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Fill out and submit the File a Claim form to <a href="mailto:fileclaim@whiteshoe.net">fileclaim@whiteshoe.net</a>.</p>
        </div>
      </section>
    </div>
  );
};

export default Arbitrate;
