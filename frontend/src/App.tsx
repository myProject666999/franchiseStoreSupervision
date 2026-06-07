import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import AreaList from './pages/AreaList';
import StoreList from './pages/StoreList';
import CheckItemList from './pages/CheckItemList';
import TaskList from './pages/TaskList';
import CheckinList from './pages/CheckinList';
import InspectionList from './pages/InspectionList';
import InspectionDetail from './pages/InspectionDetail';
import RectificationList from './pages/RectificationList';
import MonthlyRanking from './pages/MonthlyRanking';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="areas" element={<AreaList />} />
        <Route path="stores" element={<StoreList />} />
        <Route path="check-items" element={<CheckItemList />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="checkins" element={<CheckinList />} />
        <Route path="inspections" element={<InspectionList />} />
        <Route path="inspections/:id" element={<InspectionDetail />} />
        <Route path="rectifications" element={<RectificationList />} />
        <Route path="ranking" element={<MonthlyRanking />} />
      </Route>
    </Routes>
  );
};

export default App;
