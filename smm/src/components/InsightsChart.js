import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import {Chart as ChartJS} from 'chart.js/auto'


// Grafici per profile insight
function TopWordsChart({ chartData }) {
  return <Doughnut data={chartData} options={{}} />;
}

function AverageImpressionsChart({ chartData }) {
  return <Bar data={chartData} options={{
    elements: {
      bar: {
        backgroundColor: 'rgba(0, 0, 255, 0.7)', 
        borderColor: 'rgba(0, 0, 255, 1)',
        borderWidth: 1, 
      },
    },
}} />
}

function AverageCommentsChart({ chartData }) {
  return <Bar data={chartData} options={{
    elements: {
      bar: {
        backgroundColor: 'rgba(255, 255, 0, 0.7)', 
        borderColor: 'rgba(255,255, 1)',
        borderWidth: 1, 
      },
    },
}} />
}

function AveragePosReactionsChart({ chartData }) {
  return <Bar data={chartData} options={{
    elements: {
      bar: {
        backgroundColor: 'rgba(0, 255, 0, 0.7)', 
        borderColor: 'rgba(0, 255, 0, 1)',
        borderWidth: 1, 
      },
    },
}} />
}

function AverageNegReactionsChart({ chartData }) {
  return <Bar data={chartData} options={{
    elements: {
      bar: {
        backgroundColor: 'rgba(255, 0, 0, 0.7)', 
        borderColor: 'rgba(255, 0, 0, 1)',
        borderWidth: 1, 
      },
    },
}} />
}


// Grafici per squeal insight

function BipartiteReactionsChart({ chartData }) {
  return <Pie data={chartData} options={{}} />
}

function CompareAvgImpressionsChart({ chartData }) {
  return <Bar data={chartData} options={{}} />
}

function CompareAvgCommentsChart({ chartData }) {
  return <Bar data={chartData} options={{
    elements: {
      bar: {
        backgroundColor: 'rgba(255, 255, 0, 0.7)',
        borderColor: 'rgba(255,255, 1)',
        borderWidth: 1,
      },
    },
}} />
}

function ImpressionsVsReactionsChart({ chartData }) {
  return <Bar data={chartData} options={{
    elements: {
      bar: {
        backgroundColor: 'rgba(0, 255, 0, 0.7)',
        borderColor: 'rgba(0, 255, 0, 1)',
        borderWidth: 1,
      },
    },
}} />
}

function ImpressionsVsCommentsChart({ chartData }) {
  return <Bar data={chartData} options={{
    elements: {
      bar: {
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        borderColor: 'rgba(255, 0, 0, 1)',
        borderWidth: 1,
      },
    },
}} />
}

export default TopWordsChart
export { AverageImpressionsChart };
export { AverageCommentsChart };
export { AveragePosReactionsChart };
export { AverageNegReactionsChart };
export { BipartiteReactionsChart };
export { CompareAvgImpressionsChart };
export { CompareAvgCommentsChart };
export { ImpressionsVsReactionsChart };
export { ImpressionsVsCommentsChart };