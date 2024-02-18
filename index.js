import React, { useEffect, useState } from 'react';
import './style.css';
import ReactGA from 'react-ga';

import ReactPDF from './ES';

const ReportPDF = (props) => {
  const [reportLink, setReportLink] = useState(null);
  const { search } = props.location;

  const onPageScroll = (page) => {
    if (
      document.querySelectorAll('.pdf-thumbnail-bar> div').length > 0 &&
      document.querySelectorAll('.pdf-thumbnail-bar> div')[page - 1]
    )
      document.querySelectorAll('.pdf-thumbnail-bar> div')[page - 1].scrollIntoView({ block: 'center' });
  };

  const initialize = () => {
    const report = new URLSearchParams(search).get('report');
    setReportLink(report);
  };


  useEffect(() => {
    initialize();

  }, []);
  return (
    <ReactPDF
      url={reportLink}
      showToolbox
      showProgressBar
      showThumbnailSidebar
      onChangePage={onPageScroll}
      filename={props.match.params.name}
    />
  );
};

export default ReportPDF;
