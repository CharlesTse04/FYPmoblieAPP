import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme, Box ,Stack,Typography,Chip,Tooltip} from '@mui/material'; // 保留这一行

import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { DashboardLayout, AppProvider } from '@toolpad/core';
import { useDemoRouter } from '@toolpad/core/internal';
import { useNavigate } from 'react-router-dom';
import Table from './table.jsx';
import AddCard from './AddNewCard.jsx';
import Usertable from './usertable.jsx';
import Cardtable from './cardtable.jsx';
import Galleriestable from './Gallertable.jsx';
import Register from './Register.jsx';
import AddGaller from './AddNewGaller.jsx';
import BuyCard from './buyCard.jsx';
import OrderTable from './ordertable.jsx';
import Invoice from './invoice.jsx';
import SalesReport from './SalesReportSearch.jsx';
import LoginId from "../getData/loginId.jsx";
import Diversity3Icon from '@mui/icons-material/Diversity3';
import CommentIcon from '@mui/icons-material/Comment';
import AddCommentIcon from '@mui/icons-material/AddComment';
import EngineeringIcon from '@mui/icons-material/Engineering';
import NewCompetition from './newCompetition.jsx';
import CompetitionList from './CompetitionList.jsx';
import Newstaff from './NewStaff.jsx';
import StaffList from './staffList.jsx';
import NewInvoice from './NewbuyInvoice.jsx';
import ReOrder from './reOrder.jsx';
import CreateQRcode from './createQRcode.jsx';


// 删除这行： import { createTheme } from '@mui/material'; 

// 继续您的组件实现

const createNavigation = () => {
  const loginId = LoginId();
  const navigation = [
    {
      segment: 'invoice',
      title: 'Invoice',
      icon: <AssignmentTurnedInIcon />,
      children: [
        { segment: 'invoicelist', title: 'Invoice List', icon: <AssignmentTurnedInIcon /> },
        { segment: 'newinvoice', title: 'New Invoice', icon: <AddIcon /> },
        { segment: 'reOrder', title: 'Reorder', icon: <HistoryIcon /> },
      ],
    },
    {
      segment: 'order',
      title: 'Order',
      icon: <ShoppingCartIcon />,
      children: [
        { segment: 'newOrder', title: 'New Order', icon: <AddIcon /> },
        { segment: 'inStore', title: 'In Store Order', icon: <AddShoppingCartIcon /> },
        { segment: 'orderHistory', title: 'Order History', icon: <HistoryIcon /> },
      ],
    },
    {
      segment: 'competition',
      title: 'Competition',
      icon: <Diversity3Icon />,
      children: [
        { segment: 'createQRcode', title: 'Create QRcode', icon: <CommentIcon /> },
        { segment: 'competitionlist', title: 'Competition List', icon: <CommentIcon /> },
        { segment: 'newcompetition', title: 'New Competition', icon: <AddCommentIcon /> },
      ],
    },
    {
      segment: 'product',
      title: 'Product',
      icon: <WysiwygIcon />,
      children: [
        {
          segment: 'galleries',
          title: 'Galleries',
          icon: <AutoAwesomeMotionIcon />,
          children: [
            { segment: 'galleriesList', title: 'Galleries List', icon: <FormatListBulletedIcon /> },
            { segment: 'newGallery', title: 'New Gallery', icon: <AddIcon /> },
          ],
        },
        {
          segment: 'card',
          title: 'Card',
          icon: <ArticleIcon />,
          children: [
            { segment: 'cardList', title: 'Card List', icon: <FormatListBulletedIcon /> },
            { segment: 'newCard', title: 'New Card', icon: <AddIcon /> },
          ],
        },
      ],
    },
    {
      segment: 'customer',
      title: 'Customer',
      icon: <PeopleIcon />,
      children: [
        { segment: 'customerList', title: 'Customer List', icon: <FormatListBulletedIcon /> },
        { segment: 'newCustomer', title: 'New Customer', icon: <AddIcon /> },
      ],
    },
    {
      segment: 'reports',
      title: 'Reports',
      icon: <BarChartIcon />,
      children: [
        { segment: 'sales', title: 'Sales Report', icon: <DescriptionIcon /> },
        { segment: 'traffic', title: 'Traffic', icon: <DescriptionIcon /> },
      ],
    },
  ];

  // Add staff navigation if the user has permissions
  if (loginId && loginId.manage === "Yes") {
    navigation.push({
      segment: 'staff',
      title: 'Staff',
      icon: <EngineeringIcon />,
      children: [
        { segment: 'stafflist', title: 'Staff List', icon: <FormatListBulletedIcon /> },
        { segment: 'newstaff', title: 'New Staff', icon: <AddIcon /> },
      ],
    });
  }

  return navigation;
};

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname }) {
  const navigate = useNavigate();
  let content = null;

  if (pathname === '/order/newOrder') {
    content = <Table />;
  } else if (pathname === '/product/card/newCard') {
    content = <AddCard />;
  } else if (pathname === '/order/orderHistory') {
    content = <OrderTable />;
  } else if (pathname === '/customer/customerList') {
    content = <Usertable />;
  } else if (pathname === '/product/card/cardList') {
    content = <Cardtable />;
  } else if (pathname === '/product/galleries/galleriesList') {
    content = <Galleriestable />;
  } else if (pathname === '/customer/newCustomer') {
    content = <Register />;
  } else if (pathname === '/product/galleries/newGallery') {
    content = <AddGaller />;
  } else if (pathname === '/order/inStore') {
    content = <BuyCard />;
  } else if (pathname === '/invoice/invoicelist') {
    content = <Invoice />;
  } else if (pathname === '/invoice/newinvoice') {
    content = <NewInvoice />;
  } else if (pathname === '/reports/sales') {
    content = <SalesReport />;
  } else if (pathname === '/invoice') {
    content = <NewInvoice />;
  } else if (pathname === '/order') {
    content = <BuyCard />;
  } else if (pathname === '/product') {
    content = <AddGaller />;
  } else if (pathname === '/customer') {
    content = <Register />;
  } else if (pathname === '/reports') {
    content = <SalesReport />;
  } else if (pathname === '/staff') {
    content = <Newstaff />;
  } else if (pathname === '/competition') {
    content = <NewCompetition />;
  } else if (pathname === '/competition/newcompetition') {
    content = <NewCompetition />;
  } else if (pathname === '/competition/competitionlist') {
    content = <CompetitionList />;
  } else if (pathname === '/competition/createQRcode') {
    content = <CreateQRcode />;
  } else if (pathname === '/staff/newstaff') {
    content = <Newstaff />;
  } else if (pathname === '/staff/stafflist') {
    content = <StaffList />;
  } else if (pathname === '/invoice/reOrder') {
    content = <ReOrder />;
  }
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {content}
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>

    <img 
        src="/static/media/logo.d69ee03599f482173f98.png" 
        alt="Logo" 
        style={{ width: '40px', height: 'auto' }} 
    />

      <Typography variant="h6">Oztet Amigo</Typography>
      <Tooltip title="Connected to production">
       
      </Tooltip>
    </Stack>
  );
}

function DashboardLayoutAccount(props) {
  const { window } = props;
  const navigate = useNavigate();
  const loginId = LoginId();
  const [session, setSession] = React.useState({
    user: {
      name: loginId.name,
      email: loginId.email
    },
  });

  const authentication = React.useMemo(() => ({
    signIn: () => {
      setSession({
        user: {
          name: loginId.name,
          email: loginId.email
        },
      });
    },
    signOut: () => {
      localStorage.setItem('Login', null);
      navigate('/');
    },
  }), [navigate]);

  const router = useDemoRouter('/dashboard');
  const demoWindow = window !== undefined ? window() : undefined;

  const NAVIGATION = createNavigation(); // Get the updated navigation

  return (
    <>

 <AppProvider
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout  
      slots={{
          appTitle: CustomAppTitle,

        }} >
        
        {/* 隐藏现有 logo */}
        {/* <ExistingLogoComponent /> */}
        
        {/* 添加您的新 logo */}
    

        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
    </>
  );
}

 
DashboardLayoutAccount.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutAccount;