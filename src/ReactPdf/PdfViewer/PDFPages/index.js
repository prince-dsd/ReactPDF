/* eslint-disable no-underscore-dangle */
import React from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsViewer from 'pdfjs-dist/legacy/web/pdf_viewer';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
import 'pdfjs-dist/web/pdf_viewer.css';
import './index.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
export class PdfPages extends React.Component {
  componentDidMount() {
    this.setupViewer();
    this.stream(this.props);
    document.addEventListener('scroll', this.onScroll, true);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.scale && newProps.scale !== this.props.scale) {
      this.zoom(newProps.scale, newProps.currentPage);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.onScroll);
  }

  setupViewer = () => {
    pdfjsLib.disableTextLayer = false;
    // pdfjsLib.externalLinkTarget = pdfjsViewer.LinkTarget.PARENT;
    const eventBus = new pdfjsViewer.EventBus();
    // PDF Link Service
    const pdfLinkService = new pdfjsViewer.PDFLinkService({
      eventBus,
      externalLinkTarget: 2,
    });

    const pdfFindController = new pdfjsViewer.PDFFindController({
      eventBus,
      linkService: pdfLinkService,
    });
    // PDF Viewer
    const container = document.getElementById('pdf-pages');
    const pdfViewer = new pdfjsViewer.PDFViewer({
      container,
      eventBus,
      linkService: pdfLinkService,
      findController: pdfFindController,
    });
    eventBus.on('pagesinit', () => {
      pdfViewer.currentScaleValue = 'page-fit';
    });
    this._pdfViewer = pdfViewer;
    this._pdfLinkService = pdfLinkService;
    pdfLinkService.setViewer(pdfViewer);

    // Set external Refs
    this.props.setPdfViewer(pdfViewer);
    this.props.setFindController(pdfFindController);
  };

  onScroll = () => {
    if (this._pdfViewer) {
      this.props.setCurrentPage(this._pdfViewer.currentPageNumber);
    }
  };

  setUpDownload = () => {
    const pdfDM = new pdfjsViewer.DownloadManager();
    this.props.setPdfBlob(this.pdfBlob, pdfDM);
  };

  stream = (props) => {
    const url = props.url;
    if (url) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';

      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          this.props.updateProgressBar(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const _ab = xhr.response;
          this.pdf = _ab;
          this.pdfBlob = new Blob([_ab]);
          this.setUpDownload();
          this.loadPDF(_ab);
        } else {
          console.error('Error while requesting', url);
        }
      };

      xhr.onerror = () => {
        console.error('Error while requesting', url);
      };

      xhr.send();
    }
  };

  loadPDF = () => {
    const src = this.pdf;
    if (!src) {
      return;
    }
    const loadingTask = pdfjsLib.getDocument({
      data: src,
    });

    loadingTask.promise.then(
      (pdf) => {
        this._pdf = pdf;
        this.props.setPdf(this._pdf);
        this.update();
        this.updateScale();
      },
      (err) => {
        const error = err.name || err.toString();
        this.pdfLoadError.emit(error);
      }
    );
  };

  updateScale = () => {
    this._pdf
      .getPage(1)
      .then(() => {
        this._pdfViewer.currentScaleValue = 'page-fit';
      })
      .catch((err) => {
        console.error(err);
      });
  };

  zoom = (scale, current) => {
    this._zoom = scale;
    this._pdfViewer.currentScale = this._zoom;
    this._pdfViewer.currentPageNumber = current;
  };

  update() {
    if (this._pdfViewer) {
      this._pdfViewer.setDocument(this._pdf);
    }
    if (this._pdfLinkService) {
      this._pdfLinkService.setDocument(this._pdf, null);
    }
    this.render();
  }

  render() {
    return <div />;
  }
}

export default PdfPages;
