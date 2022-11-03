import { Row, Col, Table, Card } from "react-bootstrap"
import { useEffect } from 'react';
import { getOrderbook } from '../utils';
import useRefresh from '../hooks/useRefresh';


export default function OrderBook(props) {
  const { fastRefresh } = useRefresh();

  const fetchOrderBook = async (market, program) => {
    let orderbook = await getOrderbook(market, program);
    if (orderbook.data.success) {
      orderbook.data.result.asks !== undefined && props.setAsks(orderbook.data.result.asks);
      orderbook.data.result.bids !== undefined && props.setBids(orderbook.data.result.bids);
      props.setBaseAddress(orderbook.data.result.baseMintAddress);
      props.setQuoteAddress(orderbook.data.result.quoteMintAddress);
    }
  }

  useEffect(() => {
    if (props.marketAddress.length === 44 && props.programAddress.length === 44) {
      fetchOrderBook(props.marketAddress, props.programAddress);
    }
    // eslint-disable-next-line
  }, [fastRefresh]);

  return (
    <Card>
      <Card.Title className="text-center mt-2" style={{ color: '#FDB03C' }}>
        <h4><b>📖 Order Book</b></h4>
      </Card.Title>
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
              <tbody style={{ backgroundColor: "#CDE4D2" }}>
                {
                  props.bids.map((a, index) => {
                    return <tr key={String(a.orderId)}>
                      <td>{a.orderId}</td>
                      <td>{(parseFloat(a.price) * parseFloat(a.size)).toFixed(6)}</td>
                      <td>{a.price.toFixed(6)}</td>
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
              <tbody style={{ backgroundColor: "#F29B9B" }}>
                {
                  props.asks.map((a, index) => {
                    return <tr key={String(a.orderId)} >
                      <td>{a.orderId}</td>
                      <td>{(parseFloat(a.price) * parseFloat(a.size)).toFixed(6)}</td>
                      <td>{a.price.toFixed(6)}</td>
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
  )
}