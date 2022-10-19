import { Card, Table } from "react-bootstrap"
import { useState, useEffect } from 'react';
import { getFills } from '../utils';
import useRefresh from '../hooks/useRefresh';


export default function FilledOrders(props) {
  const { fastRefresh } = useRefresh();

  const [fills, setFills] = useState([]);

  const fetchFills = async (market, program) => {
    let resfills = await getFills(market, program);
    if (resfills.data.success)
      setFills(resfills.data.result);
  }

  useEffect(() => {
    if (props.marketAddress.length === 44 && props.programAddress.length === 44) {
      fetchFills(props.marketAddress, props.programAddress);
    }
    // eslint-disable-next-line
  }, [fastRefresh]);

  return (
    <Card className="mb-4">
      <Card.Title className="text-center mt-2" style={{ color: '#FDB03C' }}>
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
                  <tr key={String(fill.orderId + index)} style={{ backgroundColor: "#CDE4D2" }}>
                    <td style={{ cursor: "normal" }}>🟢</td>
                    <td>{fill.orderId}</td>
                    <td>{fill.openOrders}</td>
                    <td>{fill.price}</td>
                    <td>{fill.side}</td>
                    <td>{fill.size}</td>
                  </tr>
                  :
                  <tr key={String(fill.orderId + index)} style={{ backgroundColor: "#F29B9B" }}>
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
  )
}