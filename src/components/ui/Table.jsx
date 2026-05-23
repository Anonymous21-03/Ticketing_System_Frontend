import './Table.css';

export default function Table({ headers, children, className = '' }) {
  return (
    <div className={`table-wrapper ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}
