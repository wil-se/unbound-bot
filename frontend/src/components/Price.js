import { Row, Card } from "react-bootstrap"
import { getPairInfo } from '../utils';
import { useEffect } from 'react';
import useRefresh from '../hooks/useRefresh';


export default function Price(props) {
  const { fastRefresh } = useRefresh();

  const fetchPairInfo = async (baseAddress, quoteAddress) => {
    let info = await getPairInfo(baseAddress, quoteAddress);
    if (info.data.success) {
      props.setBaseSymbol(info.data.result.baseSymbol);
      props.setQuoteSymbol(info.data.result.quoteSymbol);
      props.setPrice(info.data.result.reversedPrice);
    }
  }

  useEffect(() => {
    if (props.baseAddress !== "" && props.quoteAddress !== "") {
      fetchPairInfo(props.baseAddress, props.quoteAddress);
    }
    // eslint-disable-next-line
  }, [fastRefresh]);

  return (
    <Card className="mt-2 mb-3">
      <Card.Title className="text-center mt-2" style={{ color: '#FDB03C' }}>
        <h4><b>🏷️ Price</b></h4>
      </Card.Title>
      <Card.Body style={{ backgroundColor: "#fffffb" }}>
        <Row className="text-center">
          <h5>{
            props.baseSymbol !== "" && props.quoteSymbol !== "" && props.price !== 0 ?
              `${props.baseSymbol}/${props.quoteSymbol}: ${props.price}` :
              ''
          }</h5>
        </Row>
      </Card.Body>
    </Card>
  )
}