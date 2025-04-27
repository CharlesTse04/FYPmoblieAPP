import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Grid } from "@mui/material"; // 引入 Grid
import { getDatabase, ref, onValue } from "firebase/database";
import cong from '../assets/index'; // 确保正确导入您的 Firebase 配置
import Card from "./card.jsx";

const CardData = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true); // 添加加载状态
  const [error, setError] = useState(null); // 添加错误状态

  
  useEffect(() => {
    const db = getDatabase(cong);
    const cardsRef = ref(db, 'cards/'); // 确保指向正确的数据库路径

    const unsubscribe = onValue(cardsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const cardsList = Object.values(data);
        setCards(cardsList);
      } else {
        setCards([]); // 如果没有数据，清空卡片列表
      }
      setLoading(false); // 数据加载完成
    }, (error) => {
      setError(error); // 捕获错误
      setLoading(false); // 数据加载完成
    });

    return () => unsubscribe(); // 清理订阅
  }, []);

  if (loading) return <CircularProgress />; // 显示加载指示器
  if (error) return <Typography color="error">Error loading data: {error.message}</Typography>; // 显示错误信息

  return (
    <Box>
      <Grid container spacing={2}> {/* 使用 Grid 组件 */}
        {cards.map((card) => (
          <Grid item key={card.cardId}> {/* 设置响应式列 */}
            <Card
              cardId={card.cardId}
              name={card.name}
              quantity={card.quantity}
              price={card.price}
              image={card.image}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CardData;