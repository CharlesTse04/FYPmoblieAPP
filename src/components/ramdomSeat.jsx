function randomSeat({ row }) {
    // 確保 participants 存在且是陣列
    const participants = Array.isArray(row.participants) ? [...row.participants] : [];
    
    // Fisher-Yates 隨機打亂陣列
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }
  
    const pairs = [];
    
    // 兩兩配對
    for (let i = 0; i < participants.length; i += 2) {
      // 如果是最後一個且奇數，單獨成對
      if (i === participants.length - 1) {
        pairs.push([participants[i]]);
      } else {
        pairs.push([participants[i], participants[i + 1]]);
      }
    }
  
    return pairs;
  }