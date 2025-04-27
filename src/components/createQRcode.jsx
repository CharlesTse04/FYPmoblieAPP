import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { getDatabase, ref, onValue } from 'firebase/database';
import cong from '../assets/index'; // Ensure correct Firebase config import

const QRCodeGenerator = () => {
  const [inputValue, setInputValue] = useState('');
  const [competitions, setCompetitions] = useState([]);


  const handleCompetitionSelect = (event) => {
    setInputValue(event.target.value); // Set the selected competition key as input value
  };

  useEffect(() => {
    const db = getDatabase(cong);
    const competitionRef = ref(db, 'competitions/');

    // Listen for changes in the competitions reference
    onValue(competitionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const keys = Object.keys(data); // Get the keys of competitions
        setCompetitions(keys); // Set the keys in state
      }
    });
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <h1>QR Code Generator</h1>
      <div style={{ marginBottom: '20px' }}>
        <select
          onChange={handleCompetitionSelect}
          value={inputValue} // Set the select value to inputValue
          style={{ padding: '10px', width: '300px' }}
        >
          <option value="">Select a competition</option>
          {competitions.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
      <QRCodeCanvas value={inputValue} />
    </div>
  );
};

export default QRCodeGenerator;