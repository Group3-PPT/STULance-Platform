import React from 'react';
import { Form, Button } from 'react-bootstrap';

const FilterSidebar = () => {
  return (
    <aside className="glass-card filter-sidebar p-4 sticky-top">
      <h3 className="h5 mb-4 text-primary fw-bold">Bộ lọc</h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label className="small">Lĩnh vực</Form.Label>
          <Form.Select className="bg-transparent text-white border-secondary">
            <option className="bg-dark">Tất cả lĩnh vực</option>
            <option className="bg-dark">Lập trình Web</option>
            <option className="bg-dark">Thiết kế Mobile</option>
            <option className="bg-dark">Marketing</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-4">
          <Form.Label className="small">Mức lương</Form.Label>
          <Form.Range min="0" max="100" />
        </Form.Group>

        <Button variant="primary" className="w-100 fw-bold">Áp dụng</Button>
      </Form>
    </aside>
  );
};

export default FilterSidebar;