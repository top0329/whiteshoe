import React from 'react';
import '../../assets/css/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function DocumentationPage() {

  const termsAndConditionsUrl = 'https://whiteshoe.net/termsofservice';
  // <li><Link to="/privacypolicy" onClick={closeMenu}>Privacy Policy</Link></li>
  const privacypolicy = 'https://www.whiteshoe.net/privacypolicy';
  // Array of documentation files
  const docsFiles = [
    // { name: 'Terms and Conditions for Whiteshoe Work', path: '/public/WS_content/WS_Work_TC.pdf' },
    { name: 'Arbitration Rules', path: '/public/WS_content/WHITESHOE_RULES.pdf' },
    // {name:'Privacy Policy',path}
    { name: 'Arbitration Fee Schedule', path: '/public/WS_content/WS_FEE_SCHEDULE.pdf' },
    { name: 'File a Claim', path: '/public/WS_content/fileclaim.pdf' },
    { name: 'Agreement to Arbitrate', path: '/WS_content/agreementtoarbitrate.pdf' },
    { name: 'Standards of Conduct', path: '/public/WS_content/WHITESHOE_CONDUCT.pdf' },
    { name: '規則 (Traditional Chinese)', path: '/public/WS_content/WHITESHOE_RULES_TZH.pdf' },
    { name: '规则 (Simplified Chinese)', path: '/public/WS_content/WHITESHOE_CONDUCT_SZH.pdf' },
    { name: 'ルール (Japanese)', path: '/public/WS_content/WHITESHOE_RULES_JA.pdf' },
    { name: '규칙 (Korean)', path: '/public/WS_content/WHITESHOE_RULES_KO.pdf' },
    { name: 'नियम (Hindi)', path: '/public/WS_content/WHITESHOE_RULES_HI.pdf' },
    { name: 'قواعد (Arabic)', path: '/public/WS_content/WHITESHOE_RULES_AR.pdf' },
    { name: 'Kurallar (Turkish)', path: '/public/WS_content/WHITESHOE_RULES_TR.pdf' },
    { name: 'Règles (French)', path: '/public/WS_content/WHITESHOE_RULES_FR.pdf' },
    { name: 'Reglas (Spanish)', path: '/public/WS_content/WHITESHOE_RULES_ES.pdf' },
    { name: 'Kamachikuykuna (Quechua) ', path: '/public/WS_content/WHITESHOE_RULES_QU.pdf' },
    { name: 'Regras (Portugese)', path: '/public/WS_content/WHITESHOE_RULES_PT.pdf' },
    { name: 'Regeln (German)', path: '/public/WS_content/WHITESHOE_RULES_DE.pdf' },
    { name: 'Regole (Italian)', path: '/public/WS_content/WHITESHOE_RULES_IT.pdf' },
    { name: 'Zasady (Polish)', path: '/public/WS_content/WHITESHOE_RULES_PL.pdf' },
    { name: 'Szabályok (Hungarian)', path: '/public/WS_content/WHITESHOE_RULES_HU.pdf' },
    { name: 'Правила (Russian)', path: '/public/WS_content/WHITESHOE_RULES_RU.pdf' },
    { name: 'Правила (Ukrainian) ', path: '/public/WS_content/WHITESHOE_RULES_UK.pdf' },
  ];

  return (
    <div>
      <div id="main">
        <div className="documentation-content">
          <h2>Documentation</h2>
          <p>Email admin@whiteshoe.net for specific inquiries.</p>
          <ul>
            <li key={0}><a href={termsAndConditionsUrl}>Terms and Conditions for Whiteshoe Work</a></li>
            <li key={1}><a href={privacypolicy}>Privacy Policy</a></li>
            {docsFiles.map((file, index) => (
              <li key={index}>
                <a href={file.path} download>
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DocumentationPage;
