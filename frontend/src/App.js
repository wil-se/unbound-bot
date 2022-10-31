import './App.css';
import { Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import MarketSelector from './components/MarketSelector';
import TokenMintAddresses from './components/TokenMintAddresses';
import Price from './components/Price';
import BidAskMaker from './components/BidAskMaker';
import OpenOrders from './components/OpenOrders';
import FilledOrders from './components/FilledOrders';
import OrderBook from './components/OrderBook';
import NavbarMenu from './components/Navbar';
import BidAMMConfig from './components/BidAMMConfig';
import BidAMMConfig2 from './components/BidAMMConfig2';

function App() {
  const [marketAddress, setMarketAddress] = useState("");
  const [programAddress, setProgramAddress] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [quoteAddress, setQuoteAddress] = useState("");
  const [baseSymbol, setBaseSymbol] = useState("");
  const [quoteSymbol, setQuoteSymbol] = useState("");
  const [price, setPrice] = useState(0);
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  
  return (
    <>
      <NavbarMenu />
      <Container>
        <Row>
          <MarketSelector setMarketAddress={setMarketAddress} setProgramAddress={setProgramAddress} />
        </Row>
        <Row>
          <TokenMintAddresses baseAddress={baseAddress} quoteAddress={quoteAddress} baseSymbol={baseSymbol} quoteSymbol={quoteSymbol} />
        </Row>
        <Row>
          <Price baseAddress={baseAddress} quoteAddress={quoteAddress} price={price} setPrice={setPrice} baseSymbol={baseSymbol} quoteSymbol={quoteSymbol} setBaseSymbol={setBaseSymbol} setQuoteSymbol={setQuoteSymbol} />
        </Row>
        <Row>
          <BidAskMaker marketAddress={marketAddress} programAddress={programAddress} />
        </Row>
        <Row>
          <OpenOrders marketAddress={marketAddress} programAddress={programAddress} />
        </Row>
        {/* <Row>
          <BidAMMConfig asks={asks} bids={bids} price={price} />
        </Row> */}
        {/* <Row>
          <BidAMMConfig2 asks={asks} bids={bids} price={price} />
        </Row> */}
        <Row>
          <FilledOrders marketAddress={marketAddress} programAddress={programAddress} />
        </Row>
        <Row className='mb-5'>
          <OrderBook asks={asks} setAsks={setAsks} bids={bids} setBids={setBids} marketAddress={marketAddress} programAddress={programAddress} setBaseAddress={setBaseAddress} setQuoteAddress={setQuoteAddress} />
        </Row>
      </Container>
    </>
  );
}

export default App;