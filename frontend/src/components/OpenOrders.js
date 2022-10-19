import { Row, Col, Card, Table, Button, Modal } from "react-bootstrap"
import { useState } from 'react';
import { getOrders, cancelAllOrders, cancelOrder, settleFunds } from '../utils';


export default function OpenOrders(props) {
  const [orders, setOrders] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(0);

  const handleCancelOrder = async () => { await cancelOrder(props.marketAddress, props.programAddress, selectedOrderId) }
  const handleCancelAllOrders = async () => { await cancelAllOrders(props.marketAddress, props.programAddress) }
  const handleSettle = async () => { await settleFunds(props.marketAddress, props.programAddress) }
  const handleFetchOrders = async () => {
    if (props.marketAddress.length === 44 && props.programAddress.length === 44) {
      let orders = await getOrders(props.marketAddress, props.programAddress);
      if (orders.data.success)
        setOrders(orders.data.result);
    }
  }
  const handleCloseDelete = () => setShowDelete(false);
  const handleShowDelete = () => setShowDelete(true);
  const handleCloseDeleteAll = () => setShowDeleteAll(false);
  const handleShowDeleteAll = () => setShowDeleteAll(true);
  const handleCloseSettle = () => setShowSettle(false);
  const handleShowSettle = () => setShowSettle(true);

  return (
    <>
      <Card className="mb-4">
        <Card.Title className="text-center mt-2" style={{ color: '#FDB03C' }}>
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
  )
}