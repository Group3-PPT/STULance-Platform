import React from 'react';
import { Badge } from 'react-bootstrap';
import { Globe, MapPin } from 'lucide-react';

const JobCardSidebar = ({ job, isActive }) => {
    return (
        <div className={`hub-sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="d-flex gap-2 mb-2">
                <span className="hub-badge-new">NEW</span>
            </div>
            <h3 className="hub-sidebar-title">{job.title}</h3>
            <div className="hub-sidebar-remote"><Globe size={14} className="me-1"/> {job.remote}</div>
            <div className="hub-sidebar-salary"><strong>{job.salary}</strong> <small>{job.unit}</small></div>
            <div className="hub-sidebar-meta">
                <span><MapPin size={12}/> {job.location}</span>
                <span>{job.station}</span>
            </div>
            <div className="hub-sidebar-tags mt-2">
                {job.tags.slice(0, 2).map(tag => <span key={tag}>#{tag}</span>)}
            </div>
        </div>
    );
};

export default JobCardSidebar;