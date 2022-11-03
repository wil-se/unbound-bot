import { Row, Col, Form, Card } from "react-bootstrap"

export default function MarketSelector(props) {
  return (
    <Card className="mt-2 mb-3">
      <Card.Title className='text-center mt-2' style={{ color: '#FDB03C' }}>
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
              onChange={(value) => { props.setMarketAddress(value.target.value) }}
              defaultValue=""
            />
            <Form.Text className={{ color: '#ffe4ea' }}>
              MBB/SOL: 2g3Fv1c1gWhWkzDxRSnRp3q2x7kvsF3HZDyXgpUFh58Q
            </Form.Text>
          </Col>
          <Col xs={6}>
            <Form.Label htmlFor="dexaddress">DEX address</Form.Label>
            <Form.Control
              type="text"
              id="dexaddress"
              aria-describedby="dexaddress"
              onChange={(value) => { props.setProgramAddress(value.target.value) }}
              defaultValue=""
            />
            <Form.Text className={{ color: '#ffe4ea' }}>
              Serum V3: 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin
            </Form.Text>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}