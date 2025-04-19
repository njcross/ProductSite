import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CharacterList from '../components/CharacterList';
import FilterBy from '../components/FilterBy';
import ViewingOptions from '../components/ViewingOptions';
import './Cards.css';

export default function Cards() {
  const [filter, setFilter] = useState('');
  const [view, setView] = useState('grid');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sort, setSort] = useState('name');
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';


  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  return (
    <div className="cards-page">
      <div className="container-fluid">
        <h2 className="text-center text-white mb-4">Marvel Character Cards</h2>
        <div className="row gx-4">
          <div className="col-md-3">
            <div className="filter-sidebar">
              <FilterBy onFilterChange={setFilter} />
            </div>
          </div>
          <div className="col-md-9">
            <ViewingOptions
              viewMode={view}
              onViewModeChange={setView}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              sortBy={sort}
              onSortChange={setSort}
              search={search}
              onClearSearch={clearSearch}
            />
            <CharacterList
              filter={filter}
              search={search}
              view={view}
              itemsPerPage={itemsPerPage}
              sortBy={sort}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
