import { Row, Col, Form, Card } from "react-bootstrap"


export default function TokenMintAddresses(props) {
  return (
    <Card className="mt-2 mb-3">
      <Card.Title className='text-center mt-2' style={{ color: '#FDB03C' }}>
        <h4><b>🪙 Token Mint Addresses</b></h4>
      </Card.Title>
      <Card.Body style={{ backgroundColor: "#fffffb" }}>
        <Row className="mb-4">
          <Col xs={6}>
            <Form.Label htmlFor="pairaddress">Base Address ({props.baseSymbol})</Form.Label>
            <Form.Control
              type="text"
              id="baseaddress"
              aria-describedby="baseaddress"
              disabled
              value={props.baseAddress}
            />
          </Col>
          <Col xs={6}>
            <Form.Label htmlFor="quoteaddress">Quote Address ({props.quoteSymbol})</Form.Label>
            <Form.Control
              type="text"
              id="quoteaddress"
              aria-describedby="quoteaddress"
              disabled
              value={props.quoteAddress}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}