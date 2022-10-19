import { Row, Col, Navbar, Nav, Container } from "react-bootstrap"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';


export default function NavbarMenu(props) {
  return (
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
  )
}