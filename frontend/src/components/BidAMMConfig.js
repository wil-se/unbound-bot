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

export default function BidAMMConfig(props) {
  const { fastRefresh } = useRefresh();
  const [priceWidth, setPriceWidth] = useState(20);
  const [priceInterval, setPriceInterval] = useState(0.1);

  function buildChartData(asks, bids) {
    let minAskPrice = asks.length !== 0 ? asks[0].price : 0;
    let asksDict = {};
    let asksLabels = [];
    let asksData = [];
    let asksColors = [];
    if (asks.length !== 0) {
      for (let i = minAskPrice; i <= minAskPrice + priceWidth + priceInterval; i = i + parseFloat(priceInterval)) {
        asksDict[fixDecimal(i, 1)] = 0;
      }
    }
    asks.map(ask => {
      if (asksDict[fixDecimal(ask.price, 1)] !== undefined) {
        asksDict[fixDecimal(ask.price, 1)]++;
      }
    });

    let minBidPrice = bids.length !== 0 ? bids[0].price : 0;
    let bidsDict = {};
    let bidsLabels = [];
    let bidsData = [];
    let bidsColors = [];
    if (bids.length !== 0) {
      for (let i = minBidPrice - priceWidth; i <= minBidPrice + priceInterval; i = i + parseFloat(priceInterval)) {
        bidsDict[fixDecimal(i, 1)] = 0;
      }
    }
    bids.map(bid => {
      if (bidsDict[fixDecimal(bid.price, 1)] !== undefined) {
        bidsDict[fixDecimal(bid.price, 1)]++;
      }
    });

    let maxLength = priceWidth;
    for (const [key, value] of Object.entries(bidsDict).sort(([key1, value1], [key2, value2]) => { return parseFloat(key1) - parseFloat(key2) }).slice(Object.entries(bidsDict).length - maxLength, Object.entries(bidsDict).length)) {
      bidsLabels.push(key);
      bidsData.push(value);
      bidsColors.push('rgba(0, 255, 0, 0.9)')
    }
    for (const [key, value] of Object.entries(asksDict).sort(([key1, value1], [key2, value2]) => { return parseFloat(key1) - parseFloat(key2) }).slice(0, maxLength)) {
      asksLabels.push(key);
      asksData.push(value);
      asksColors.push('rgba(255, 0, 0, 0.9)')
    }

    let labels = bidsLabels.concat(asksLabels);
    let data = {};
    data.label = 'Orders'
    data.data = bidsData.concat(asksData);
    data.backgroundColor = bidsColors.concat(asksColors);

    return [data, labels];
  }


  const [data, setData] = useState({
    labels: [],
    datasets: []
  });
  const [options, setOptions] = useState(
    {
      responsive: true,
      scales: {
        y: {
          ticks: { color: 'white', beginAtZero: true }
        },
        x: {
          ticks: { color: 'white', beginAtZero: true }
        }
      },
      plugins: {
        autocolors: false,
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: 0,
              yMax: 20,
              xMin: fixDecimal(props.price,1),
              xMax: fixDecimal(props.price,1),
              borderColor: 'white',
              borderWidth: 1,
              label: {
                content: `${fixDecimal(props.price,1)}`,
                display: true
              },
            }
          }
        }
      },
    }
  );

  useEffect(() => {
    // eslint-disable-next-line
    let [dset, labels] = buildChartData(props.asks, props.bids);
    setData({
      labels: labels,
      datasets: [
        dset,
      ]
    })
    setOptions(
      {
        responsive: true,
        scales: {
          y: {
            ticks: { color: 'white', beginAtZero: true }
          },
          x: {
            ticks: { color: 'white', beginAtZero: true }
          }
        },
        plugins: {
          autocolors: false,
          annotation: {
            annotations: {
              line1: {
                type: 'line',
                yMin: 0,
                yMax: 20,
                xMin: fixDecimal(props.price,1),
                xMax: fixDecimal(props.price,1),
                borderColor: 'white',
                borderWidth: 1,
                label: {
                  content: `${fixDecimal(props.price,1)}`,
                  display: true
                },
              }
            }
          }
        },
      }
    )
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
              onChange={(value) => { setPriceWidth(value.target.value) }}
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
              onChange={(value) => { setPriceInterval(value.target.value) }}
              min={0}
              onWheel={(e) => e.target.blur()}
            />
          </Col>
        </Row>
        <Bar options={options} data={data} />
      </Card.Body>
    </Card>
  )
}