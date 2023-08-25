import { useState, useEffect } from 'react';
import SearchBar from './SearchBar/SearchBar';
import ImageGalery from './ImageGalery/ImageGalery';
import Modal from './Modal/Modal';
import fetchPixabay from 'services/pixabay';
import Button from './Button/Button';
import Loader from './Loader/Loader';

export const App = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [selectedIMG, setSelectedIMG] = useState(false);

  const UseToggleModal = () => {
    setIsShowModal(prev => !prev);
  };

  useEffect(() => {
    if (items.length > 0 || searchText) {
      setIsLoading(true);
      fetchPixabay(searchText, currentPage)
        .then(resp => {
          if (!resp.ok) {
            setError('Sorry, something not good');
            throw new Error();
          }
          return resp.json();
        })
        .then(data => {
          if (data.totalHits === 0) {
            setError('Sorry, nothing');
            throw new Error();
          } else {
            setItems([...items, ...data.hits]);
            setTotalHits(data.totalHits);
          }
        })
        .catch(err => console.log(err))
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [searchText, currentPage]);

  const handlerImageClick = ({
    target: {
      dataset: { original },
    },
  }) => {
    UseToggleModal();
    setSelectedIMG(original);
  };

  const handlerLoadMore = () => {
    setCurrentPage(prevCurrentPage => prevCurrentPage + 1);
  };

  const handlerSubmit = value => {
    setSearchText(value);
    setCurrentPage(1);
    setItems([]);
    setError('');
  };

  return (
    <>
      <SearchBar handlerSubmit={handlerSubmit} />
      {isShowModal && (
        <Modal handlerCloseModal={UseToggleModal} selectedIMG={selectedIMG} />
      )}
      {items.length > 0 && (
        <ImageGalery items={items} handlerImageClick={handlerImageClick} />
      )}
      {isLoading && <Loader />}
      {items.length < totalHits && !error && !isLoading && (
        <Button handlerLoadMore={handlerLoadMore} />
      )}
      {error && <p className="error">{error}</p>}
    </>
  );
};
