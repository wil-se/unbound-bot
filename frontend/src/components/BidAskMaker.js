import { Row, Col, Form, Card, Button } from "react-bootstrap"
import { useState } from 'react';
import { placeOrder } from '../utils';


export default function BidAskMaker(props) {
  const [bidPrice, setBidPrice] = useState(0);
  const [bidSize, setBidSize] = useState(0);
  const [bidOrderType, setBidOrderType] = useState('limit');
  const [askPrice, setAskPrice] = useState(0);
  const [askSize, setAskSize] = useState(0);
  const [askOrderType, setAskOrderType] = useState('limit');

  const handlePlaceAskOrder = async () => {
    await placeOrder(props.marketAddress, props.programAddress, 'buy', askPrice, askSize, askOrderType);
  }
  const handlePlaceBidOrder = async () => {
    await placeOrder(props.marketAddress, props.programAddress, 'sell', bidPrice, bidSize, bidOrderType);
  }

  return (
    <>
      <Col xs={12} md={6} className="ps-xl-0">
        <Card className="mt-2 mb-4">
          <Card.Title className='text-center mt-2' style={{ color: '#FDB03C' }}>
            <h4><b>🟢 Bid (buy)</b></h4>
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
            <Button onClick={handlePlaceBidOrder} style={{ backgroundColor: "green", borderColor: "green" }} className="mt-4 w-100">Send Bid</Button>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12} md={6} className="pe-xl-0">
        <Card className="mt-2 mb-4">
          <Card.Title className='text-center mt-2' style={{ color: '#FDB03C' }}>
            <h4><b>🔴 Ask (sell)</b></h4>
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
            <Button onClick={handlePlaceAskOrder} style={{ backgroundColor: "red", borderColor: "red" }} className="mt-4 w-100">Send Ask</Button>
          </Card.Body>
        </Card>
      </Col>
    </>
  )
}