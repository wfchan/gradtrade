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

    // Convert dates to Date objects for consistent parsing
    const dateObjects = dates.map(date => new Date(date));
    
    // Find the closest date index for a given trade date
    const findClosestDateIndex = (tradeDate) => {
      const tradeDateObj = new Date(tradeDate);
      
      // First try exact match
      const exactMatchIndex = dates.findIndex(date => date === tradeDate);
      if (exactMatchIndex !== -1) return exactMatchIndex;
      
      // If no exact match, find the closest date
      let closestIndex = 0;
      let minDiff = Infinity;
      
      dateObjects.forEach((dateObj, index) => {
        const diff = Math.abs(dateObj.getTime() - tradeDateObj.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });
      
      return closestIndex;
    };
    
    // Prepare buy and sell markers
    const buyMarkers = trades
      .filter(trade => trade.type === 'buy')
      .map(trade => {
        const closestDateIndex = findClosestDateIndex(trade.date);
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
        const closestDateIndex = findClosestDateIndex(trade.date);
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
      borderColor: 'rgba(80, 80, 80, 0.8)',
      borderWidth: 2,
      borderDash: [8, 6],
      label: {
        display: true,
        content: `Grid ${index} - $${level}`,
        position: 'start',
        backgroundColor: 'rgba(60, 60, 60, 0.9)',
        color: 'white',
        font: {
          size: 14,
          weight: 'bold'
        },
        padding: 8
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
            borderWidth: 2,
            tension: 0.2,
            fill: true
          },
          {
            label: 'Buy Orders',
            data: buyMarkers,
            backgroundColor: 'rgba(54, 162, 235, 0.9)',
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 2,
            pointStyle: 'triangle',
            pointRadius: 8,
            pointHoverRadius: 12,
            showLine: false
          },
          {
            label: 'Sell Orders',
            data: sellMarkers,
            backgroundColor: 'rgba(255, 99, 132, 0.9)',
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 2,
            pointStyle: 'triangle',
            pointRadius: 8,
            pointHoverRadius: 12,
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: {
              top: 10,
              right: 12,
              bottom: 10,
              left: 12
            },
            cornerRadius: 6,
            callbacks: {
              title: function(tooltipItems) {
                return new Date(tooltipItems[0].label).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
              },
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
            labels: {
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 16
            }
          },
          title: {
            display: true,
            text: `${stockData.symbol} Grid Trading Chart`,
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
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
              text: 'Date',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 4
              }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 12
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Price ($)',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: {
                top: 4,
                bottom: 10
              }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            },
            ticks: {
              font: {
                size: 12
              }
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
    <div className="grid-trade-chart-container" style={{ height: '900px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default GridTradeChart;
