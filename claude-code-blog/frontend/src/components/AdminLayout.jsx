import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  TagsOutlined,
  CommentOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/admin/articles', icon: <FileTextOutlined />, label: '文章管理' },
  { key: '/admin/categories', icon: <AppstoreOutlined />, label: '分类管理' },
  { key: '/admin/tags', icon: <TagsOutlined />, label: '标签管理' },
  { key: '/admin/comments', icon: <CommentOutlined />, label: '评论管理' },
  { key: '/admin/settings', icon: <SettingOutlined />, label: '系统设置' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { token: themeToken } = theme.useToken();

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login', { replace: true });
  };

  const userDropdownItems = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人信息',
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  // If no token, don't render the layout (redirect will happen via useEffect)
  if (!localStorage.getItem('token')) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        {/* Sidebar Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Link to="/admin/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>
            {collapsed ? (
              <span style={{ fontSize: 20, fontWeight: 'bold' }}>CC</span>
            ) : (
              <span style={{ fontSize: 16, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                Claude Code 管理
              </span>
            )}
          </Link>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        {/* Top Header */}
        <Header
          style={{
            padding: '0 24px',
            background: themeToken.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
            position: 'sticky',
            top: 0,
            zIndex: 9,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 48, height: 48 }}
          />

          <Dropdown menu={userDropdownItems} placement="bottomRight">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 8,
              }}
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                src={adminUser.avatar}
                style={{ backgroundColor: themeToken.colorPrimary }}
              />
              <span style={{ fontSize: 14, color: themeToken.colorText }}>
                {adminUser.nickname || adminUser.username || '管理员'}
              </span>
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 280,
            background: themeToken.colorBgContainer,
            borderRadius: themeToken.borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
