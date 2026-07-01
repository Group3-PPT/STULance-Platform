import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Send } from 'lucide-react';

const JobCard = ({ title, description, skills, price, jobId, onBidClick }) => {
  return (
    <div className="card glass-card job-card p-4 mb-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-start flex-wrap">
        <div style={{ flex: 1 }}>
          <h3 className="h4 job-title">{title}</h3>
          <p className="text-secondary my-3">{description}</p>
          <div className="d-flex gap-2">
            {skills?.map((skill, index) => (
              <Badge key={index} className="skill-badge">{skill}</Badge>
            ))}
          </div>
        </div>
        <div className="text-md-end mt-3 mt-md-0">
          <div className="h4 price-text">{price}</div>
          <Button 
            variant="outline-primary" 
            className="btn-sm mt-3 px-4 fw-bold d-inline-flex align-items-center gap-2"
            onClick={() => onBidClick && onBidClick(jobId)}
          >
            <Send size={14} /> Gửi báo giá
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
