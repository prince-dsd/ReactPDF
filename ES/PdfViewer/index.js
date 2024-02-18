/* eslint-disable no-underscore-dangle */
import React, { PureComponent } from 'react';

import PDFPages from './PDFPages';
import PDFToolbox from './PDFToolbox';
import PDFThumbBar from './PDFThumbBar';
import PDFSearchBar from './PDFSearchBar';
import PDFProgressBar from './PDFProgressBar';

import './index.css';

const ZOOM_STEP = 0.2;
const DEVICE_WIDTH = window.innerWidth;
const SMALL_SCREEN = 600;
class PdfViewer extends PureComponent {
  state = {
    pdf: null,
    scale: 1,
    progress: 0,
    currentPage: 1,
    showSearchBar: false,
    showThumbSidebar: DEVICE_WIDTH < SMALL_SCREEN ? false : this.props.showThumbnailSidebar,
  };

  setCurrentPage = (currentPage) => {
    if (currentPage !== this.state.currentPage) {
      this.setState({ currentPage });
      const { onChangePage } = this.props;
      onChangePage && onChangePage(currentPage);
    }
  };

  setPdf = (pdf) => {
    this.setState({ pdf });
  };

  setPdfViewer = (pdfViewer) => {
    this.setState({ pdfViewer });
  };

  setFindController = (findController) => {
    // eslint-disable-next-line no-underscore-dangle
    this._pdfFindController = findController;
  };

  onZoomIn = () => {
    const zoomInMax = this.state.pdfViewer.currentScale + ZOOM_STEP;
    if (Math.round(zoomInMax * 100) > 500) return;
    this.setState((state) => ({
      scale: zoomInMax,
    }));
    const { onZoomIn } = this.props;
    onZoomIn && onZoomIn(zoomInMax);
  };

  onZoomOut = () => {
    const zoomOutMax = this.state.pdfViewer.currentScale - ZOOM_STEP;
    if (Math.round(zoomOutMax * 100) < 20) return;
    this.setState((state) => ({
      scale: zoomOutMax,
    }));
    const { onZoomOut } = this.props;
    onZoomOut && onZoomOut(zoomOutMax);
  };

  onDownload = () => {
    const { onDownload, pdfURL, filename } = this.props;
    if (this.pdfDm) {
      this.pdfDm.download(this.pdfBlob, pdfURL || '', `${filename || 'default'}.pdf`);
      onDownload && onDownload();
    }
  };

  updateProgressBar = (progress) => {
    this.setState({ progress });
    const { onProgress } = this.props;
    onProgress && onProgress();
  };

  onChangePage = (e) => {
    const newPageNum = Number(e.target.value);
    this.scrollTo(newPageNum);
  };

  scrollTo = (page) => {
    this.setCurrentPage(page);
    this.goToPage(page);
  };

  goToPage = (pageNumber) => {
    const { pdfViewer } = this.state;
    pdfViewer.currentPageNumber = pageNumber;
  };

  toggleThumbnail = () => {
    this.setState({
      showThumbSidebar: !this.state.showThumbSidebar,
    });
    const { onToggleThumbnail } = this.props;
    onToggleThumbnail && onToggleThumbnail(!this.state.showThumbSidebar);
  };

  showSearchBar = () => {
    this.setState({
      showSearchBar: true,
    });
  };

  hideSearchBar = () => {
    this.setState({
      showSearchBar: false,
    });
  };

  setPdfBlob = (blob, pdfDM) => {
    this.pdfDm = pdfDM;
    this.pdfBlob = blob;
  };

  render() {
    const { pdf, progress, scale, currentPage, showSearchBar, showThumbSidebar, pdfViewer } = this.state;

    const { url, showProgressBar, showToolbox } = this.props;

    return (
      <div id='viewer-container'>
        {showProgressBar && <PDFProgressBar progress={progress} />}
        <div id='viewer'>
          {/* PDF SearchBar */}
          {showSearchBar && (
            <PDFSearchBar pdfFindController={this._pdfFindController} hideSearchBar={this.hideSearchBar} />
          )}

          {/* PDFThumbBar */}
          <PDFThumbBar
            pdf={pdf}
            pdfViewer={pdfViewer}
            currentPage={currentPage}
            setCurrentPage={this.scrollTo}
            showThumbSidebar={showThumbSidebar}
          />

          {/* PDF Content */}
          <div className={`pdfViewer ${!showThumbSidebar ? 'full' : ''}`}>
            {/* PDF Toolbox */}
            {showToolbox && (
              <PDFToolbox
                pdf={pdf}
                currentPage={currentPage}
                setCurrentPage={this.setCurrentPage}
                goToPage={this.goToPage}
                showThumbSidebar={showThumbSidebar}
                toggleThumbnail={this.toggleThumbnail}
                onZoomIn={this.onZoomIn}
                onZoomOut={this.onZoomOut}
                showSearchBar={this.showSearchBar}
                onChangePage={this.onChangePage}
                onDownload={this.onDownload}
                mobileDevice={DEVICE_WIDTH < SMALL_SCREEN}
              />
            )}

            {/* PDF Pages */}
            <div id='pdf-pages' className={!showThumbSidebar && 'pdf-pages-sidebar'}>
              {url && (
                <PDFPages
                  url={url}
                  scale={scale}
                  currentPage={currentPage}
                  setPdf={this.setPdf}
                  setPdfViewer={this.setPdfViewer}
                  setFindController={this.setFindController}
                  setCurrentPage={this.setCurrentPage}
                  updateProgressBar={this.updateProgressBar}
                  setPdfBlob={this.setPdfBlob}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PdfViewer;
