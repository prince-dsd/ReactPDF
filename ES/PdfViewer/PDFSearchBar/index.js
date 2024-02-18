import React, { Component } from 'react';
import { debounce } from 'lodash';

import { CloseIcon, NextIcon, PrevIcon } from '../../assets';

import './index.css';

const FIND_STATUS_TIMEOUT = 500;
class SearchBar extends Component {
  searchInput = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      currentMatchIndex: 1,
      matchesCountTotal: undefined,
      searchCompleted: false,
    };

    this.onSearchTerm = debounce(this.onSearch.bind(this), 500);
  }

  onSearch = () => {
    const searchTerm = this.searchInput.current.value;

    this.setState({
      searchTerm,
      searchCompleted: false,
    });

    this.props.pdfFindController.executeCommand('find', {
      caseSensitive: false,
      findPrevious: undefined,
      highlightAll: true,
      phraseSearch: true,
      query: searchTerm,
    });

    setTimeout(() => {
      const {
        _matchesCountTotal,
        pageMatches,
        selected: { pageIdx },
      } = this.props.pdfFindController;

      const currentMatchIndex = pageIdx === 0 ? 1 : this.getCurrentMatchIndex(pageMatches, pageIdx);

      this.setState({
        searchCompleted: true,
        currentMatchIndex,
        matchesCountTotal: _matchesCountTotal,
      });
    }, FIND_STATUS_TIMEOUT);
  };

  findAgain = ({ findPrevious }) => {
    this.props.pdfFindController.executeCommand('findagain', {
      caseSensitive: false,
      findPrevious,
      highlightAll: true,
      phraseSearch: true,
      query: this.state.searchTerm,
    });
  };

  onSearchNext = (e) => {
    if (e.keyCode === 13 && e.target.value === this.state.searchTerm) {
      this.nextMatch({ onSearch: true });
    }
  };

  previousMatch = () => {
    const { currentMatchIndex } = this.state;
    if (currentMatchIndex === 1) return;
    this.setState({ currentMatchIndex: currentMatchIndex - 1 });
    this.findAgain({ findPrevious: true });
  };

  nextMatch = ({ onSearch }) => {
    const { currentMatchIndex, matchesCountTotal } = this.state;
    let nextMatchIndex = 0;

    if (currentMatchIndex === matchesCountTotal) {
      if (!onSearch) return;
      nextMatchIndex = 1;
    } else {
      nextMatchIndex = currentMatchIndex + 1;
    }
    this.setState({ currentMatchIndex: nextMatchIndex });
    this.findAgain({ findPrevious: false });
  };

  getCurrentMatchIndex = (pageMatches, pageIdx) => {
    let currentMatchIndex = 1;
    for (let i = 0; i < pageIdx; i++) {
      currentMatchIndex += pageMatches[i].length;
    }
    return currentMatchIndex;
  };

  closeSearchBar = () => {
    this.props.pdfFindController.executeCommand('find', {
      caseSensitive: false,
      findPrevious: undefined,
      highlightAll: true,
      phraseSearch: true,
      query: '',
    });

    this.setState({
      searchCompleted: false,
      matchesCountTotal: undefined,
    });
    this.props.hideSearchBar();
  };

  render() {
    const { searchTerm, currentMatchIndex, matchesCountTotal, searchCompleted } = this.state;

    return (
      <div id='pdfSearchbar'>
        <input
          ref={this.searchInput}
          autoFocus
          placeholder='Search in document'
          onChange={this.onSearchTerm}
          onKeyDown={this.onSearchNext}
        />

        <div className='search-info'>
          {searchTerm && (
            <span className='search-status'>
              {/* Search Status */}
              {searchCompleted && (
                <span>
                  {matchesCountTotal ? (
                    <span>
                      {currentMatchIndex}/{matchesCountTotal}
                    </span>
                  ) : (
                    <span>0/0</span>
                  )}
                </span>
              )}
              {/* Prev Icon */}
              {matchesCountTotal > 0 && (
                <PrevIcon
                  className={`search-bar-ico ${currentMatchIndex === 1 ? 'disabled' : ''}`}
                  onClick={this.previousMatch}
                />
              )}
              {/* Next Icon */}
              {matchesCountTotal > 0 && (
                <NextIcon
                  className={`next-icon search-bar-ico ${currentMatchIndex === matchesCountTotal ? 'disabled' : ''}`}
                  onClick={this.nextMatch}
                />
              )}
            </span>
          )}
          <CloseIcon id='close-icon' className='search-bar-ico' onClick={this.closeSearchBar} />
        </div>
      </div>
    );
  }
}

export default SearchBar;
