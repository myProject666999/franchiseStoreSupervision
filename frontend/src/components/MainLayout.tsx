import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  OrderedListOutlined,
  CameraOutlined,
  FileTextOutlined,
  WarningOutlined,
  TrophyOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { apiService } from '../services/api';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    apiService.clearToken();
    navigate('/login');
  };

  const getRoleText = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: '系统管理员',
      supervisor: '督导员',
      store_manager: '店长',
      area_manager: '区域经理',
    };
    return roleMap[role] || role;
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据概览',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
      roles: ['admin'],
    },
    {
      key: '/areas',
      icon: <EnvironmentOutlined />,
      label: '区域管理',
      roles: ['admin'],
    },
    {
      key: '/stores',
      icon: <ShopOutlined />,
      label: '门店管理',
    },
    {
      key: '/check-items',
      icon: <CheckSquareOutlined />,
      label: '检查项管理',
      roles: ['admin'],
    },
    {
      key: '/tasks',
      icon: <OrderedListOutlined />,
      label: '督导任务',
    },
    {
      key: '/checkins',
      icon: <CameraOutlined />,
      label: '打卡记录',
    },
    {
      key: '/inspections',
      icon: <FileTextOutlined />,
      label: '检查报告',
    },
    {
      key: '/rectifications',
      icon: <WarningOutlined />,
      label: '整改管理',
    },
    {
      key: '/ranking',
      icon: <TrophyOutlined />,
      label: '月度排名',
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || !user || item.roles.includes(user.role)
  );

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">{collapsed ? '督导' : '门店督导系统'}</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredMenuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ padding: '0 24px' }}>
            {collapsed ? (
              <MenuUnfoldOutlined onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 16, cursor: 'pointer' }} />
            ) : (
              <MenuFoldOutlined onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 16, cursor: 'pointer' }} />
            )}
          </div>
          <div style={{ padding: '0 24px' }}>
            <Dropdown menu={{ items: userMenuItems }}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user?.realName}</span>
                <span style={{ color: '#999', fontSize: 12 }}>({getRoleText(user?.role || '')})</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
