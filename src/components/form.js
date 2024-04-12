import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import '../index.css'; // Import CSS file

const MenWellness = () => {
  const [quotes, setQuotes] = useState([]);
  const [quoteData, setQuoteData] = useState({
    _id: '',
    topic: '',
    quote: '',
    author: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchResultsCount, setSearchResultsCount] = useState(0);
  const [filteredQuotes, setFilteredQuotes] = useState([]);

  const quotesFormRef = useRef(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    const filteredQuotes = quotes.filter(quote =>
      quote.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQuotes(filteredQuotes);
    setSearchResultsCount(filteredQuotes.length);
  }, [searchQuery, quotes]);

  const fetchQuotes = async () => {
    try {
      const response = await axios.get('https://menwellnessquotes.onrender.com/api/quotes');
      setQuotes(response.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const addQuote = async () => {
    if (!quoteData.topic || !quoteData.quote || !quoteData.author) {
      showMessage("Please fill in all fields before saving the quote.", "error");
      return;
    }
  
    try {
      const response = await axios.post('https://menwellnessquotes.onrender.com/api/quotes', quoteData);
      setQuotes([...quotes, response.data]);
      setQuoteData({ _id: '', topic: '', quote: '', author: '' });
      setShowConfetti(true);
      showMessage("Your quote has been saved.", "success");
      setTimeout(() => setShowConfetti(false), 10000); // Hide confetti after 10 seconds
    } catch (error) {
      showMessage("Error adding quote", "error");
      console.error('Error adding quote:', error);
    }
  };  

  const deleteQuote = async (id) => {
    try {
      await axios.delete(`https://menwellnessquotes.onrender.com/api/quotes/${id}`);
      setQuotes(quotes.filter(quote => quote._id !== id));
      showMessage("Quote deleted successfully", "success");
    } catch (error) {
      showMessage("Error deleting quote", "error");
      console.error('Error deleting quote:', error);
    }
  };

  const updateQuote = async () => {
    try {
      const { _id, topic, quote, author } = quoteData;
      await axios.put(`https://menwellnessquotes.onrender.com/api/quotes/${_id}`, { topic, quote, author });
      fetchQuotes(); // Refresh quotes after update
      setQuoteData({ _id: '', topic: '', quote: '', author: '' }); // Reset form fields
      showMessage("Quote updated successfully", "success");
    } catch (error) {
      showMessage("Error updating quote", "error");
      console.error('Error updating quote:', error);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000); // Hide message after 5 seconds
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuoteData({ ...quoteData, [name]: value });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const scrollToQuotesForm = () => {
    quotesFormRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="men-wellness-container">
      <h1>Men Wellness</h1>
      <input
        //type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="🔍 Search by topic..."
        className="search-bar"
      />
      <div className='search-results-count'>{searchResultsCount} results found</div>
      <div className='quotes-form' ref={quotesFormRef}>
        <h3>Drop your hot quote</h3>
        <input
          type="text"
          value={quoteData.topic}
          onChange={handleChange}
          name="topic"
          placeholder="topic...mental health, sports , growth, education "
        />
        <input
          type='text'
          value={quoteData.quote}
          onChange={handleChange}
          name="quote"
          placeholder="Enter your quote..."
        ></input>
        <input
          type="text"
          value={quoteData.author}
          onChange={handleChange}
          name="author"
          placeholder="Author..."
        />
        {quoteData._id ? (
          <button onClick={updateQuote}>Update Quote</button>
        ) : (
          <button onClick={addQuote}>Save Quote</button>
        )}
      </div>
      <ul className="quote-list">
        {filteredQuotes.map(quote => (
          <li key={quote._id} className="quote-item">
            <div className="quote-content">
              <strong style={{ marginBottom: '8px' }}>Topic:</strong> <span style={{ color: "green", marginBottom: '8px' }}>{quote.topic}</span><br />
              <strong style={{ marginBottom: '8px' }}>Quote:</strong> <span style={{ marginBottom: '8px' }}>{quote.quote}</span><br />
              <em style={{ marginBottom: '8px' }}>Author:</em> <span style={{ fontStyle: 'italic', marginBottom: '8px' }}>{quote.author}</span>
            </div>
            <div className="quote-actions">
              <button onClick={() => deleteQuote(quote._id)}>Delete</button>
              <button onClick={() => { setQuoteData(quote); scrollToQuotesForm(); }}>Edit</button>
            </div>
          </li>
        ))}
      </ul>
      {showConfetti && <Confetti />}
      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
    </div>
  );
};

export default MenWellness;
