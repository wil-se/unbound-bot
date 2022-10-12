import './App.css';
import { getOrderbook, getPairInfo, placeOrder, getOrders, cancelAllOrders, cancelOrder, getFills, settleFunds } from './utils';
import { Container, Row, Col, Card, Table, Form, Navbar, Nav, Button, Modal } from 'react-bootstrap';
import useRefresh from './hooks/useRefresh';
import { useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';


function App() {
  const { fastRefresh } = useRefresh();
  const [showDelete, setShowDelete] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  const [marketAddress, setMarketAddress] = useState("");
  const [programAddress, setProgramAddress] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [baseSymbol, setBaseSymbol] = useState("");
  const [quoteAddress, setQuoteAddress] = useState("");
  const [quoteSymbol, setQuoteSymbol] = useState("");
  const [price, setPrice] = useState(0);
  const [bidPrice, setBidPrice] = useState(0);
  const [bidSize, setBidSize] = useState(0);
  const [bidOrderType, setBidOrderType] = useState('limit');
  const [askPrice, setAskPrice] = useState(0);
  const [askSize, setAskSize] = useState(0);
  const [askOrderType, setAskOrderType] = useState('limit');
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(0);
  const [fills, setFills] = useState([]);

  const fetchOrderBook = async (market, program) => {
    let orderbook = await getOrderbook(market, program);
    if (orderbook.data.success) {
      orderbook.data.result.asks !== undefined && setAsks(orderbook.data.result.asks);
      orderbook.data.result.bids !== undefined && setBids(orderbook.data.result.bids);
      setBaseAddress(orderbook.data.result.baseMintAddress);
      setQuoteAddress(orderbook.data.result.quoteMintAddress);
    }
  }

  const fetchPairInfo = async (base, quote) => {
    let info = await getPairInfo(base, quote);
    if (info.data.success) {
      setBaseSymbol(info.data.result.baseSymbol);
      setQuoteSymbol(info.data.result.quoteSymbol);
      setPrice(info.data.result.price);
    }
  }

  const fetchFills = async (market, program) => {
    let resfills = await getFills(market, program);
    if (resfills.data.success)
      setFills(resfills.data.result);
  }

  const handleFetchOrders = async (market, program) => {
    if (marketAddress.length === 44 && programAddress.length === 44) {
      let orders = await getOrders(marketAddress, programAddress);
      if (orders.data.success)
        setOrders(orders.data.result);
    }
  }

  const handlePlaceAskOrder = async () => {
    await placeOrder(marketAddress, programAddress, 'buy', askPrice, askSize, askOrderType);
  }

  const handlePlaceBidOrder = async () => {
    await placeOrder(marketAddress, programAddress, 'sell', bidPrice, bidSize, bidOrderType);
  }

  const handleCancelOrder = async () => {
    await cancelOrder(marketAddress, programAddress, selectedOrderId);
  }

  const handleCancelAllOrders = async () => {
    await cancelAllOrders(marketAddress, programAddress);
  }

  const handleSettle = async () => {
    await settleFunds(marketAddress, programAddress);
  }

  const handleCloseDelete = () => setShowDelete(false);
  const handleShowDelete = () => setShowDelete(true);
  const handleCloseDeleteAll = () => setShowDeleteAll(false);
  const handleShowDeleteAll = () => setShowDeleteAll(true);
  const handleCloseSettle = () => setShowSettle(false);
  const handleShowSettle = () => setShowSettle(true);

  useEffect(() => {
    if (marketAddress.length === 44 && programAddress.length === 44) {
      fetchOrderBook(marketAddress, programAddress);
      fetchFills(marketAddress, programAddress);
    }
    if (baseAddress !== "" && quoteAddress !== "") {
      fetchPairInfo(baseAddress, quoteAddress);
    }
    // eslint-disable-next-line
  }, [fastRefresh]);

  return (
    <>
      <Navbar variant="dark" style={{ borderBottom: "4px solid #FFFFFF" }} className="mb-4">
        <Container className="pe-0">
          <Navbar.Brand>
            <Row className='d-flex align-items-center'>
              <Col className='p-0'>
                <img alt="logo" className="logo" style={{ width: "90px", height: "90px" }} src={"https://media.tenor.com/v9sdELSzVw4AAAAM/nyan-cat-kawaii.gif"} />
              </Col>
              <Col className="align-items-center">
                <h1><b>Market Logger</b></h1>
              </Col>
            </Row>
          </Navbar.Brand>
          <Nav className="justify-content-end">
            <Nav.Link className="pe-0">
              <WalletMultiButton />
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container>

        <Row>
          <Card className="mt-2 mb-3">
            <Card.Title className='text-center mt-2' style={{color: '#FDB03C'}}>
              <h4><b>🛒 Select Market</b></h4>
            </Card.Title>
            <Card.Body>
              <Row className="mb-4">
                <Col xs={6}>
                  <Form.Label htmlFor="pairaddress">Pair address</Form.Label>
                  <Form.Control
                    type="text"
                    id="pairaddress"
                    aria-describedby="pairaddress"
                    onChange={(value) => { setMarketAddress(value.target.value) }}
                  />
                  <Form.Text className={{color: '#ffe4ea'}}>
                    SOL/USDC: 9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT
                  </Form.Text>
                </Col>
                <Col xs={6}>
                  <Form.Label htmlFor="dexaddress">DEX address</Form.Label>
                  <Form.Control
                    type="text"
                    id="dexaddress"
                    aria-describedby="dexaddress"
                    onChange={(value) => { setProgramAddress(value.target.value) }}
                  />
                  <Form.Text className={{color: '#ffe4ea'}}>
                    Serum V3: 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin
                  </Form.Text>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Row>

        <Row>
          <Card className="mt-2 mb-3">
            <Card.Title className='text-center mt-2' style={{color: '#FDB03C'}}>
              <h4><b>🪙 Token Mint Addresses</b></h4>
            </Card.Title>
            <Card.Body style={{ backgroundColor: "#fffffb" }}>
              <Row className="mb-4">
                <Col xs={6}>
                  <Form.Label htmlFor="pairaddress">Base Address ({baseSymbol})</Form.Label>
                  <Form.Control
                    type="text"
                    id="baseaddress"
                    aria-describedby="baseaddress"
                    disabled
                    value={baseAddress}
                  />
                </Col>
                <Col xs={6}>
                  <Form.Label htmlFor="quoteaddress">Quote Address ({quoteSymbol})</Form.Label>
                  <Form.Control
                    type="text"
                    id="quoteaddress"
                    aria-describedby="quoteaddress"
                    disabled
                    value={quoteAddress}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Row>

        <Row>
          <Card className="mt-2 mb-3">
            <Card.Title className="text-center mt-2" style={{color: '#FDB03C'}}>
              <h4><b>🏷️ Price</b></h4>
            </Card.Title>
            <Card.Body style={{ backgroundColor: "#fffffb" }}>
              <Row className="text-center">
                <h5>{
                  baseSymbol !== "" && quoteSymbol !== "" && price !== 0 ?
                    `${baseSymbol}/${quoteSymbol}: ${price}` :
                    ''
                }</h5>
              </Row>
            </Card.Body>
          </Card>
        </Row>

        <Row>
          <Col xs={12} md={6} className="ps-xl-0">
            <Card className="mt-2 mb-4">
              <Card.Title className='text-center mt-2' style={{color: '#FDB03C'}}>
                <h4><b>🔴 Bid</b></h4>
              </Card.Title>
              <Card.Body>
                <Row>
                  <Col xs={6}>
                    <Form.Label htmlFor="bidprice" className="mt-2">Price</Form.Label>
                    <Form.Control
                      type="number"
                      id="bidprice"
                      aria-describedby="bidprice"
                      value={bidPrice}
                      onChange={(value) => { setBidPrice(value.target.value) }}
                      min={0}
                      onWheel={(e) => e.target.blur()}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Label htmlFor="bidsize" className="mt-2">Size</Form.Label>
                    <Form.Control
                      type="number"
                      id="bidsize"
                      aria-describedby="bidsize"
                      value={bidSize}
                      onChange={(value) => { setBidSize(value.target.value) }}
                      min={0}
                      onWheel={(e) => e.target.blur()}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Label htmlFor="bidordertype" className="mt-2">Order Type</Form.Label>
                    <Form.Select aria-label="bidordertype" value={bidOrderType} onChange={(value) => { setBidOrderType(value.target.value) }}>
                      <option value="limit">limit</option>
                      <option value="ioc">ioc</option>
                      <option value="postOnly">postOnly</option>
                    </Form.Select>
                  </Col>
                  <Col xs={6}>
                    <Form.Label htmlFor="bidtotal" className="mt-2">Total</Form.Label>
                    <Form.Control
                      type="number"
                      id="bidtotal"
                      aria-describedby="bidtotal"
                      value={bidSize * bidPrice}
                      disabled
                    />
                  </Col>
                </Row>
                <Button onClick={handlePlaceBidOrder} style={{ backgroundColor: "red", borderColor: "red" }} className="mt-4 w-100">Send Bid</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} className="pe-xl-0">
            <Card className="mt-2 mb-4">
              <Card.Title className='text-center mt-2' style={{color: '#FDB03C'}}>
                <h4><b>🟢 Ask</b></h4>
              </Card.Title>
              <Card.Body>
                <Row>
                  <Col xs={6}>
                    <Form.Label htmlFor="askprice" className="mt-2">Price</Form.Label>
                    <Form.Control
                      type="number"
                      id="askprice"
                      aria-describedby="askprice"
                      value={askPrice}
                      onChange={(value) => { setAskPrice(value.target.value) }}
                      min={0}
                      onWheel={(e) => e.target.blur()}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Label htmlFor="asksize" className="mt-2">Size</Form.Label>
                    <Form.Control
                      type="number"
                      id="asksize"
                      aria-describedby="asksize"
                      value={askSize}
                      onChange={(value) => { setAskSize(value.target.value) }}
                      min={0}
                      onWheel={(e) => e.target.blur()}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Label htmlFor="askordertype" className="mt-2">Order Type</Form.Label>
                    <Form.Select aria-label="askordertype" value={askOrderType} onChange={(value) => { setAskOrderType(value.target.value) }}>
                      <option value="limit">limit</option>
                      <option value="ioc">ioc</option>
                      <option value="postOnly">postOnly</option>
                    </Form.Select>
                  </Col>
                  <Col xs={6}>
                    <Form.Label htmlFor="asktotal" className="mt-2">Total</Form.Label>
                    <Form.Control
                      type="number"
                      id="asktotal"
                      aria-describedby="asktotal"
                      value={askSize * askPrice}
                      disabled
                    />
                  </Col>
                </Row>
                <Button onClick={handlePlaceAskOrder} style={{ backgroundColor: "green", borderColor: "green" }} className="mt-4 w-100">Send Ask</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Card className="mb-4">
            <Card.Title className="text-center mt-2" style={{color: '#FDB03C'}}>
              <h4><b>📦 Open orders</b></h4>
            </Card.Title>
            <Card.Body>
              <Table striped responsive hover>
                <thead>
                  <tr>
                    <th></th>
                    <th>Order ID</th>
                    <th>Order Address</th>
                    <th>Price</th>
                    <th>Side</th>
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    orders.map((order, index) => {
                      return order.side === 'buy' ?
                        <tr key={String(order.orderId)} style={{ backgroundColor: "#CDE4D2" }}>
                          <td onClick={() => { handleShowDelete(); setSelectedOrderId(order.orderId) }} style={{ cursor: "pointer" }}>❌</td>
                          <td>{order.orderId}</td>
                          <td>{order.openOrdersAddress}</td>
                          <td>{order.price}</td>
                          <td>{order.side}</td>
                          <td>{order.size}</td>
                        </tr>
                        :
                        <tr key={String(order.orderId)} style={{ backgroundColor: "#F29B9B" }}>
                          <td onClick={() => { handleShowDelete(); setSelectedOrderId(order.orderId) }} style={{ cursor: "pointer" }}>❌</td>
                          <td>{order.orderId}</td>
                          <td>{order.openOrdersAddress}</td>
                          <td>{order.price}</td>
                          <td>{order.side}</td>
                          <td>{order.size}</td>
                        </tr>
                    })
                  }
                </tbody>
              </Table>
              <Row className='justify-content-between'>
                <Col xs={4} className='text-start'>
                  <Button onClick={handleShowDeleteAll} variant='danger' className='mb-2'>Close All</Button>
                </Col>
                <Col xs={4} className='text-center'>
                  <Button onClick={handleShowSettle} variant='secondary'>Settle Funds</Button>
                </Col>
                <Col xs={4} className='text-end'>
                  <Button onClick={handleFetchOrders} variant='primary' className='mb-2'>Refresh</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Row>

        <Row>
          <Card className="mb-4">
            <Card.Title className="text-center mt-2" style={{color: '#FDB03C'}}>
              <h4><b>✔️ Filled orders</b></h4>
            </Card.Title>
            <Card.Body>
              <Table striped responsive hover>
                <thead>
                  <tr>
                    <th></th>
                    <th>Order ID</th>
                    <th>Order Address</th>
                    <th>Price</th>
                    <th>Side</th>
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    fills.map((fill, index) => {
                      return fill.side === 'buy' ?
                        <tr key={String(fill.orderId)} style={{ backgroundColor: "#CDE4D2" }}>
                          <td style={{ cursor: "normal" }}>🟢</td>
                          <td>{fill.orderId}</td>
                          <td>{fill.openOrders}</td>
                          <td>{fill.price}</td>
                          <td>{fill.side}</td>
                          <td>{fill.size}</td>
                        </tr>
                        :
                        <tr key={String(fill.orderId)} style={{ backgroundColor: "#F29B9B" }}>
                          <td style={{ cursor: "normal" }}>🔴</td>
                          <td>{fill.orderId}</td>
                          <td>{fill.openOrders}</td>
                          <td>{fill.price}</td>
                          <td>{fill.side}</td>
                          <td>{fill.size}</td>
                        </tr>
                    })
                  }
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Row>

        <Row className='mb-5'>
          <Card>
            <Card.Body style={{ backgroundColor: "#fffffb" }}>
              <Row>
                <Col xs={12} md={6}>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>TOTAL</th>
                        <th>PRICE</th>
                        <th>SIZE</th>
                        <th>SIDE</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: "#F29B9B" }}>
                      {
                        asks.map((a, index) => {
                          return <tr key={String(a.orderId)} >
                            <td>{a.orderId}</td>
                            <td>{(parseFloat(a.price) * parseFloat(a.size)).toFixed(4)}</td>
                            <td>{a.price}</td>
                            <td>{a.size}</td>
                            <td>{a.side}</td>
                          </tr>
                        })
                      }
                    </tbody>
                  </Table>
                </Col>
                <Col xs={12} md={6}>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>TOTAL</th>
                        <th>PRICE</th>
                        <th>SIZE</th>
                        <th>SIDE</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: "#CDE4D2" }}>
                      {
                        bids.map((a, index) => {
                          return <tr key={String(a.orderId)}>
                            <td>{a.orderId}</td>
                            <td>{(parseFloat(a.price) * parseFloat(a.size)).toFixed(4)}</td>
                            <td>{a.price}</td>
                            <td>{a.size}</td>
                            <td>{a.side}</td>
                          </tr>
                        })
                      }
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Row>
      </Container>

      <Modal show={showDelete} onHide={handleCloseDelete}>
        <Modal.Header>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>Cancel order {selectedOrderId}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDelete}>
            ❌ No
          </Button>
          <Button variant="danger" onClick={() => { handleCancelOrder() && handleCloseDelete() }}>
            ✅ Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteAll} onHide={handleCloseDeleteAll}>
        <Modal.Header>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>Cancel all orders?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteAll}>
            ❌ No
          </Button>
          <Button variant="danger" onClick={() => { handleCancelAllOrders() && handleCloseDeleteAll() }}>
            ✅ Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSettle} onHide={handleSettle}>
        <Modal.Header>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>Settle Funds?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSettle}>
            ❌ No
          </Button>
          <Button variant="danger" onClick={() => { handleSettle() && handleCloseSettle() }}>
            ✅ Yes
          </Button>
        </Modal.Footer>
      </Modal>


    </>
  );
}

export default App;
