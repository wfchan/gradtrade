import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  annotationPlugin
);

const GridTradeChart = ({ stockData, gridLevels, trades }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!stockData || !stockData.data || stockData.data.length === 0 || !gridLevels || !trades) {
      return;
    }

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Prepare data for the chart
    const dates = stockData.data.map(item => item.Date);
    const prices = stockData.data.map(item => item.Close);

    // Convert dates to proper Date objects for consistent parsing
    const dateMap = {};
    stockData.data.forEach((item, index) => {
      dateMap[item.Date] = index; // Create a mapping of date strings to indices
    });
    
    // Prepare buy and sell markers
    const buyMarkers = trades
      .filter(trade => trade.type === 'buy')
      .map(trade => {
        // Find the closest date in our stock data
        const closestDateIndex = dateMap[trade.date] || 0;
        return {
          x: dates[closestDateIndex],
          y: trade.price,
          gridLevel: trade.grid_level,
          shares: trade.shares,
          amount: trade.amount,
          date: trade.date
        };
      });

    const sellMarkers = trades
      .filter(trade => trade.type === 'sell')
      .map(trade => {
        // Find the closest date in our stock data
        const closestDateIndex = dateMap[trade.date] || 0;
        return {
          x: dates[closestDateIndex],
          y: trade.price,
          gridLevel: trade.grid_level,
          shares: trade.shares,
          amount: trade.amount,
          date: trade.date
        };
      });

    // Create horizontal line annotations for grid levels
    const gridLevelAnnotations = gridLevels.map((level, index) => ({
      type: 'line',
      borderColor: 'rgba(100, 100, 100, 0.5)',
      borderWidth: 1,
      borderDash: [5, 5],
      label: {
        display: true,
        content: `Grid ${index} - $${level}`,
        position: 'start',
        backgroundColor: 'rgba(100, 100, 100, 0.7)',
        font: {
          size: 10
        }
      },
      scaleID: 'y',
      value: level
    }));

    // Create the chart
    chartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: `${stockData.symbol} Price`,
            data: prices,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1, // Thinner line (reduced from 2)
            tension: 0.1,
            fill: false
          },
          {
            label: 'Buy Orders',
            data: buyMarkers,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointStyle: 'triangle',
            pointRadius: 6, // Slightly smaller points
            pointHoverRadius: 10,
            showLine: false
          },
          {
            label: 'Sell Orders',
            data: sellMarkers,
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: 'rgba(255, 99, 132, 1)',
            pointStyle: 'triangle',
            pointRadius: 6, // Slightly smaller points
            pointHoverRadius: 10,
            rotation: 180,
            showLine: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const datasetLabel = context.dataset.label || '';
                const value = context.parsed.y;
                
                if (datasetLabel === 'Buy Orders' || datasetLabel === 'Sell Orders') {
                  const point = context.raw;
                  return [
                    `${datasetLabel}: $${value.toFixed(2)}`,
                    `Date: ${point.date}`,
                    `Grid Level: ${point.gridLevel}`,
                    `Shares: ${point.shares.toFixed(2)}`,
                    `Amount: $${point.amount.toFixed(2)}`
                  ];
                }
                
                return `${datasetLabel}: $${value.toFixed(2)}`;
              }
            }
          },
          annotation: {
            annotations: gridLevelAnnotations
          },
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `${stockData.symbol} Grid Trading Chart`
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'MMM d, yyyy',
              displayFormats: {
                day: 'MMM d'
              }
            },
            title: {
              display: true,
              text: 'Date'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            title: {
              display: true,
              text: 'Price ($)'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stockData, gridLevels, trades]);

  return (
    <div className="grid-trade-chart-container" style={{ height: '500px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default GridTradeChart;
