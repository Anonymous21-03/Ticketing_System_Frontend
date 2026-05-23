import { Search, RotateCcw } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import './SearchFilter.css';

export default function SearchFilter({
  filters,
  onChange,
  onReset,
  statuses = ['open', 'in_progress', 'resolved', 'closed'],
  priorities = ['low', 'medium', 'high', 'urgent'],
  placeholder = 'Search tickets...'
}) {
  const handleInputChange = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="search-filter-container glass-card">
      <div className="search-input-wrapper">
        <Input
          type="text"
          placeholder={placeholder}
          value={filters.q || ''}
          onChange={(e) => handleInputChange('q', e.target.value)}
          icon={Search}
          className="search-field"
        />
      </div>

      <div className="filter-selects">
        {statuses && (
          <Input
            type="select"
            value={filters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </Input>
        )}

        {priorities && (
          <Input
            type="select"
            value={filters.priority || ''}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Input>
        )}

        {onReset && (
          <Button
            variant="secondary"
            onClick={onReset}
            icon={RotateCcw}
            title="Reset Filters"
            className="reset-btn"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
