import React from 'react';
import { useSacco } from '../context/SaccoContext';
import { FileText, Download, Wallet, Landmark, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const { 
    savings, 
    loans, 
    members,
    getTotalSavings, 
    getTotalLoansIssued, 
    getTotalLoanRepayments, 
    getAvailableCash,
    getMemberName 
  } = useSacco();

  const totalSavings = getTotalSavings();
  const totalLoansIssued = getTotalLoansIssued();
  const totalRepayments = getTotalLoanRepayments();
  const outstandingLoans = totalLoansIssued - totalRepayments;
  const availableCash = getAvailableCash();

  const generatePDFHeader = (doc, title) => {
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Primary color
    doc.text('Family Sacco', 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Dark text
    doc.text(title, 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Muted text
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);
  };

  const getGeneralReportDoc = () => {
    const doc = new jsPDF();
    generatePDFHeader(doc, 'Monthly Financial Report');

    autoTable(doc, {
      startY: 50,
      head: [['Category', 'Amount (UGX)']],
      body: [
        ['Total Member Savings', totalSavings.toLocaleString()],
        ['Total Loan Repayments', totalRepayments.toLocaleString()],
        ['Total Inflows', (totalSavings + totalRepayments).toLocaleString()],
        [''],
        ['Total Loans Issued (Outflows)', totalLoansIssued.toLocaleString()],
        [''],
        ['Available Cash at Hand', availableCash.toLocaleString()],
        ['Total Outstanding Loans', outstandingLoans.toLocaleString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      didParseCell: function (data) {
        if (data.row.index === 2 || data.row.index === 6) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [16, 185, 129]; // Success green
        }
        if (data.row.index === 4 || data.row.index === 7) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [239, 68, 68]; // Danger red
        }
      }
    });
    return doc;
  };

  const getSavingsReportDoc = () => {
    const doc = new jsPDF();
    generatePDFHeader(doc, 'Comprehensive Savings Report');

    const tableData = [...savings]
      .filter(s => s.status === 'Verified')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(s => [
        s.date,
        getMemberName(s.memberId),
        s.paymentMethod || 'Cash',
        `UGX ${Number(s.amount).toLocaleString()}`
      ]);

    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Member Name', 'Method', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }, // Success color
      foot: [['', '', 'Total Savings:', `UGX ${totalSavings.toLocaleString()}`]],
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });
    return doc;
  };

  const getLoansReportDoc = () => {
    const doc = new jsPDF();
    generatePDFHeader(doc, 'Comprehensive Loans Report');

    const tableData = [...loans]
      .sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued))
      .map(l => {
        const principal = Number(l.principal);
        const interest = principal * (Number(l.interestRate) / 100);
        const totalDue = principal + interest;
        const balance = totalDue - Number(l.amountPaid);
        return [
          l.dateIssued,
          getMemberName(l.memberId),
          `UGX ${principal.toLocaleString()}`,
          `${l.interestRate}%`,
          `UGX ${balance.toLocaleString()}`,
          l.status
        ];
      });

    autoTable(doc, {
      startY: 50,
      head: [['Date Issued', 'Member Name', 'Principal', 'Interest', 'Balance Due', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] }, // Danger color
      didParseCell: function(data) {
        if (data.column.index === 5 && data.cell.raw === 'Cleared') {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    });
    return doc;
  };

  const handlePreview = (docFunc) => {
    try {
      const doc = docFunc();
      const string = doc.output('bloburl');
      window.open(string, '_blank');
    } catch (err) {
      console.error('PDF Preview Error:', err);
      alert('Failed to generate preview: ' + err.message);
    }
  };

  const handleDownload = (docFunc, filename) => {
    try {
      const doc = docFunc();
      doc.save(filename);
    } catch (err) {
      console.error('PDF Download Error:', err);
      alert('Failed to download report: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex-between">
        <div>
          <h1>Generate Reports</h1>
          <p className="text-muted">Export and view your Sacco data securely</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <FileText size={32} />
          </div>
          <h3 style={{ color: 'var(--text-primary)' }}>General Report</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Monthly summary of all inflows, outflows, and available cash.</p>
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button className="btn" onClick={() => handlePreview(getGeneralReportDoc)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Eye size={18} /> View
            </button>
            <button className="btn btn-primary" onClick={() => handleDownload(getGeneralReportDoc, 'general-report.pdf')} style={{ flex: 1 }}>
              <Download size={18} /> Download
            </button>
          </div>
        </div>

        <div className="glass-panel card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Wallet size={32} />
          </div>
          <h3 style={{ color: 'var(--text-primary)' }}>Savings Report</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Detailed breakdown of all member deposits and total savings.</p>
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button className="btn" onClick={() => handlePreview(getSavingsReportDoc)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Eye size={18} /> View
            </button>
            <button className="btn btn-success" onClick={() => handleDownload(getSavingsReportDoc, 'savings-report.pdf')} style={{ flex: 1 }}>
              <Download size={18} /> Download
            </button>
          </div>
        </div>

        <div className="glass-panel card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Landmark size={32} />
          </div>
          <h3 style={{ color: 'var(--text-primary)' }}>Loans Report</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Comprehensive view of all issued loans, balances, and status.</p>
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button className="btn" onClick={() => handlePreview(getLoansReportDoc)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Eye size={18} /> View
            </button>
            <button className="btn btn-danger" onClick={() => handleDownload(getLoansReportDoc, 'loans-report.pdf')} style={{ flex: 1 }}>
              <Download size={18} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
