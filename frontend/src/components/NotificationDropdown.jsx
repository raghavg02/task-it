import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import api from '../services/api';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/users/notifications');
            setNotifications(res.data.data);
            setUnreadCount(res.data.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/users/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-violet-600 transition-colors"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-[24px] shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-[14px] font-black text-slate-900">Notifications</h3>
                        <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">{unreadCount} Unread</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div 
                                    key={n._id}
                                    onClick={() => !n.isRead && markAsRead(n._id)}
                                    className={`px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 ${!n.isRead ? 'bg-violet-50/30' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                                        n.type === 'task_assigned' ? 'bg-blue-100 text-blue-600' :
                                        n.type === 'task_completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        {n.type === 'task_completed' ? <Check size={18} /> : <Clock size={18} />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[13px] font-bold text-slate-700 leading-snug">{n.message}</p>
                                        <p className="text-[10px] font-medium text-slate-400">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-slate-400 text-sm font-medium">No notifications yet</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="px-6 py-4 bg-slate-50/50 text-center">
                        <button className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">View All</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
