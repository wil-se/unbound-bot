import { Row, Card, Col, Form } from "react-bootstrap"
import { useEffect, useState } from 'react';
import useRefresh from '../hooks/useRefresh';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

function fixDecimal(number, digits) {
  return Math.trunc(number * Math.pow(10, digits)) / Math.pow(10, digits)
}

export default function BidAMMConfig2(props) {
  const { fastRefresh } = useRefresh();
  const [priceWidth, setPriceWidth] = useState(4);
  const [priceInterval, setPriceInterval] = useState(0.1);
  const [bidData, setBidData] = useState({ labels: [], datasets: [] });
  const [maxBid, setMaxBid] = useState(0);
  const [askData, setAskData] = useState({ labels: [], datasets: [] });
  const [minAsk, setMinAsk] = useState(0);
  const [maxY, setMaxY] = useState(15);
  const [askChartOptions, setAskChartOptions] = useState({
    responsive: true,
    scales: {
      y: {
        ticks: { color: 'white', beginAtZero: true },
        min: 0,
        max: 12,
        stepSize: 1
      },
      x: {
        ticks: { color: 'white', beginAtZero: false },
        stepSize: 0.1
      }
    }
  });
  const [bidChartOptions, setBidChartOptions] = useState({
    responsive: true,
    scales: {
      y: {
        ticks: { color: 'white', beginAtZero: true },
        min: 0,
        max: 12,
        stepSize: 1
      },
      x: {
        ticks: { color: 'white', beginAtZero: false },
        stepSize: 0.1,
      }
    }
  });
  const [scaleFactor, setScaleFactor] = useState(1.2);
  const [threshold, setThreshold] = useState(0);


  function buildBidChart(bids) {
    let maxBidPrice = bids.length !== 0 ? bids[0].price : 0;
    setMaxBid(maxBidPrice)
    let bidsDict = {};
    let bidsLabels = [];
    let bidsData = [];
    let bidsColors = [];
    if (bids.length !== 0) {
      for (let i = maxBidPrice - priceWidth; i <= maxBidPrice + priceInterval; i = i + parseFloat(priceInterval)) {
        bidsDict[fixDecimal(i, 1)] = 0;
      }
    }
    bids.map(bid => {
      if (bidsDict[fixDecimal(bid.price, 1)] !== undefined) {
        bidsDict[fixDecimal(bid.price, 1)]++;
      }
    });

    let sorted = Object.entries(bidsDict).sort(([key1, value1], [key2, value2]) => { return parseFloat(key1) - parseFloat(key2) });
    for (const [key, value] of sorted) {
      bidsLabels.push(parseFloat(key));
      bidsData.push(parseInt(value));
      if (value > maxY)
        setMaxY(value);
      bidsColors.push('rgba(0, 255, 0, 0.9)');
    }
    let labels = bidsLabels;
    let data = {};
    data.label = 'Bid'
    data.data = bidsData
    data.backgroundColor = bidsColors

    return [data, labels]
  }

  function buildAskChart(asks) {
    let minAskPrice = asks.length !== 0 ? asks[0].price : 0;
    setMinAsk(fixDecimal(minAskPrice, 1));
    let asksDict = {};
    let asksLabels = [];
    let asksData = [];
    let asksColors = [];
    if (asks.length !== 0) {
      for (let i = minAskPrice; i <= minAskPrice + priceWidth; i = i + parseFloat(priceInterval)) {
        asksDict[fixDecimal(i, 1)] = 0;
      }
    }
    asks.map(ask => {
      if (asksDict[fixDecimal(ask.price, 1)] !== undefined) {
        asksDict[fixDecimal(ask.price, 1)]++;
      }
    });
    let sorted = Object.entries(asksDict).sort(([key1, value1], [key2, value2]) => { return parseFloat(key1) - parseFloat(key2) });
    for (const [key, value] of sorted) {
      asksLabels.push(parseFloat(key));
      asksData.push(parseInt(value));
      asksColors.push('rgba(255, 0, 0, 0.9)');
      if (value > maxY)
        setMaxY(value);
    }

    let labels = asksLabels;
    let data = {};
    data.label = 'Ask'
    data.data = asksData
    data.backgroundColor = asksColors

    return [data, labels]
  }

  function computeAskChartLines(price, width, scaleFactor, threshold) {
    let annotations = {};
    let k = 0;
    let base = Math.pow(scaleFactor, k) / parseInt(width);
    while (Math.pow(scaleFactor, k) / width < width) {
      let n = (Math.pow(scaleFactor, k) / parseInt(width)) - base;
      if (n >= threshold) {
        annotations[`line_${k}`] = {
          type: 'line',
          yMin: 0,
          yMax: maxY,
          xMin: price + n,
          xMax: price + n,
          borderColor: 'yellow',
          borderWidth: 1,
          label: {
            display: true,
            content: fixDecimal(price - n, 2),
            position: `${100-k*6}%`,
            padding: 1,
            font: {
              size: 10
            }
          },
        }
      }
      k++;
    }
    return annotations;
  }

  function computeBidsChartLines(price, width, scaleFactor, threshold) {
    let annotations = {};
    let k = 0;
    let base = Math.pow(scaleFactor, k) / parseInt(width);
    while (Math.pow(scaleFactor, k) / width < width) {
      let n = (Math.pow(scaleFactor, k) / parseInt(width)) - base;
      if (n >= threshold) {
        annotations[`line_${k}`] = {
          type: 'line',
          yMin: 0,
          yMax: maxY,
          xMin: price - n,
          xMax: price - n,
          borderColor: 'yellow',
          borderWidth: 1,
          label: {
            display: true,
            content: fixDecimal(price - n, 2),
            position: `${100-k*6}%`,
            padding: 1,
            font: {
              size: 10
            }
          },
        }
      }
      k++;
    }
    return annotations;
  }

  useEffect(() => {
    let [bidData, bidLabels] = buildBidChart(props.bids);
    setBidData({
      labels: bidLabels,
      datasets: [
        bidData,
      ]
    });
    setBidChartOptions({
      responsive: true,
      scales: {
        y: {
          ticks: { color: 'white', beginAtZero: true, stepSize: 1 },
          min: 0,
          max: parseFloat(maxY) + 2,
          stepSize: 1
        },
        x: {
          type: 'linear',
          ticks: { color: 'white', beginAtZero: false, min: bidLabels[0], max: bidLabels[bidLabels.length], stepSize: 0.1 },
        }
      },
      plugins: {
        autocolors: false,
        annotation: {
          annotations: computeBidsChartLines(maxBid, priceWidth, scaleFactor, threshold)
        },
      }
    })

    let [askData, askLabels] = buildAskChart(props.asks);
    setAskData({
      labels: askLabels,
      datasets: [
        askData,
      ]
    });
    setAskChartOptions({
      responsive: true,
      scales: {
        y: {
          ticks: { color: 'white', beginAtZero: true, stepSize: 1 },
          min: 0,
          max: parseFloat(maxY) + 2,
          stepSize: 1,
          display: false
        },
        x: {
          type: 'linear',
          ticks: { color: 'white', beginAtZero: false, min: askLabels[0], max: askLabels[askLabels.length], stepSize: 0.1 },
        }
      },
      plugins: {
        autocolors: false,
        annotation: {
          annotations: computeAskChartLines(minAsk, priceWidth, scaleFactor, threshold)
        }
      },
    })

  }, [fastRefresh]);

  return (
    <Card className="mt-2 mb-3">
      <Card.Title className="text-center mt-2" style={{ color: '#FDB03C' }}>
        <h4><b>⚙️ AMM Config</b></h4>
      </Card.Title>
      <Card.Body style={{ backgroundColor: "#fffffb" }}>
        <Row className="mb-4">
          <Col xs={6}>
            <Form.Label htmlFor="width" className="mt-2">Price width</Form.Label>
            <Form.Control
              type="number"
              id="pricewidth"
              aria-describedby="pricewidth"
              value={priceWidth}
              onChange={(value) => { setPriceWidth(parseInt(value.target.value)) }}
              min={0}
              onWheel={(e) => e.target.blur()}
            />
          </Col>
          <Col xs={6}>
            <Form.Label htmlFor="priceinterval" className="mt-2">Price Interval</Form.Label>
            <Form.Control
              type="number"
              id="priceinterval"
              aria-describedby="priceinterval"
              value={priceInterval}
              onChange={(value) => { parseFloat(value.target.value) !== 0 ? setPriceInterval(parseFloat(value.target.value)) : setPriceInterval(1) }}
              min={0}
              onWheel={(e) => e.target.blur()}
            />
          </Col>
        </Row>
        <Row>
          <Row xs={12} md={12} className="d-flex align-items-center text-center">
            <Col className='text-start' xs={4}><p>Max bid: {maxBid}</p></Col>
            <Col className='text-center' xs={4}><p>Price: {fixDecimal(props.price, 4)}</p></Col>
            <Col className='text-end' xs={4}><p>Min ask: {minAsk}</p></Col>
          </Row>
          <Col xs={12} md={6}>
            <Bar options={bidChartOptions} data={bidData} />
          </Col>
          <Col xs={12} md={6}>
            <Bar options={askChartOptions} data={askData} />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col xs={6}>
            <Form.Label htmlFor="scalefactor" className="mt-2">Scale Factor</Form.Label>
            <Form.Control
              type="number"
              id="scalefactor"
              aria-describedby="scalefactor"
              value={scaleFactor}
              onChange={(value) => { parseFloat(value.target.value) > 1 ? setScaleFactor(parseFloat(value.target.value)) : setScaleFactor(parseFloat(1.1)) }}
              min={0}
              step="0.1"
              onWheel={(e) => e.target.blur()}
            />
          </Col>
          <Col xs={6}>
            <Form.Label htmlFor="threshold" className="mt-2">Threshold</Form.Label>
            <Form.Control
              type="number"
              id="threshold"
              aria-describedby="threshold"
              value={threshold}
              onChange={(value) => { value.target.value !== '' ? setThreshold(parseFloat(value.target.value)) : setThreshold(0) }}
              min={0}
              step="0.1"
              onWheel={(e) => e.target.blur()}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}