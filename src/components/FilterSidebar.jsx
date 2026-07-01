import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { SlidersHorizontal } from 'lucide-react';

const FilterSidebar = ({ onFilter }) => {
  const [field, setField] = useState('Tất cả');
  const [salaryRange, setSalaryRange] = useState(100);

  const fields = ['Tất cả', 'Lập trình Web', 'Thiết kế Mobile', 'Marketing', 'Viết lách', 'Dịch thuật'];

  const handleApply = () => {
    if (onFilter) {
      onFilter({ field, maxSalary: salaryRange * 1000000 });
    }
  };

  return (
    <aside className="glass-card filter-sidebar p-4 sticky-top">
      <h3 className="h5 mb-4 text-primary fw-bold d-flex align-items-center gap-2">
        <SlidersHorizontal size={18} /> Bộ lọc
      </h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label className="small">Lĩnh vực</Form.Label>
          <Form.Select 
            className="bg-transparent text-white border-secondary"
            value={field}
            onChange={(e) => setField(e.target.value)}
          >
            {fields.map(f => (
              <option key={f} className="bg-dark" value={f}>{f}</option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-4">
          <Form.Label className="small">Mức lương tối đa: {salaryRange}M VND</Form.Label>
          <Form.Range 
            min="0" max="100" step="5"
            value={salaryRange}
            onChange={(e) => setSalaryRange(Number(e.target.value))}
          />
          <div className="d-flex justify-content-between x-small text-white-50">
            <span>0</span>
            <span>100M+</span>
          </div>
        </Form.Group>

        <Button variant="primary" className="w-100 fw-bold" onClick={handleApply}>
          ÁP DỤNG
        </Button>
      </Form>
    </aside>
  );
};

export default FilterSidebar;
