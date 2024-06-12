import React, { useContext } from 'react';
import ReactLoading from 'react-loading';
import '../../assets/css/styles.css'; // Make sure you have a corresponding CSS file for styles
import { AuthContext } from '../../provider/auth-provider';

const Spinner = () => {
  const { loading } = useContext(AuthContext);
  console.log({ loading })
  return (
    loading && (
      <div className='loading-container'>
        <ReactLoading
          type={'bubbles'}
          color={'#000'}
          height={100}
          width={100}
        />
      </div>
    )
  );
};

export default Spinner;
