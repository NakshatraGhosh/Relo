import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { formatMonth } from '../utils'
import { TOTAL_CALLS } from '../config'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

const PALETTE = {
  fights: '#e11d63',
  distance: '#8b5cf6',
  dates: '#ec4899',
  photos: '#fb923c',
  problems: '#10b981',
  calls: '#06b6d4',
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#3b0f2a',
      padding: 10,
      cornerRadius: 10,
      displayColors: false,
      titleFont: { family: 'Quicksand', weight: 700 },
      bodyFont: { family: 'Quicksand' },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9d6b84', font: { family: 'Quicksand', size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(225,29,99,0.08)' },
      ticks: { color: '#9d6b84', font: { family: 'Quicksand', size: 11 }, precision: 0 },
    },
  },
}

function gradientFill(context, color) {
  const { chart } = context
  const { ctx, chartArea } = chart
  if (!chartArea) return color
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  g.addColorStop(0, `${color}55`)
  g.addColorStop(1, `${color}08`)
  return g
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={{ color }}>{value.toLocaleString()}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}

function ChartCard({ title, sub, children }) {
  return (
    <div className="chart-card">
      <div className="chart-head">
        <h3>{title}</h3>
        {sub && <p>{sub}</p>}
      </div>
      <div className="chart-body">{children}</div>
    </div>
  )
}

export default function Analytics({ stats, summary }) {
  const months = stats.map((s) => formatMonth(s.month))
  const fights = stats.map((s) => s.fights)
  const distance = stats.map((s) => s.longDistanceDays)
  const dates = stats.map((s) => s.dates)
  const photos = stats.map((s) => s.photoCount)
  const problems = stats.map((s) => s.problemsSolved)

  const totalFights = fights.reduce((a, b) => a + b, 0)
  const totalDistance = distance.reduce((a, b) => a + b, 0)
  const totalDates = dates.reduce((a, b) => a + b, 0)
  const totalPhotos = photos.reduce((a, b) => a + b, 0)
  const totalProblems = problems.reduce((a, b) => a + b, 0)

  const statCards = [
    { label: 'days together', value: summary.daysTogether, hex: PALETTE.dates },
    { label: 'days i have loved you crazy', value: summary.daysLovedCrazy, hex: PALETTE.fights },
    { label: 'fights (and we won every one)', value: totalFights, hex: PALETTE.fights },
    { label: 'long-distance days survived', value: totalDistance, hex: PALETTE.distance },
    { label: 'phone calls', value: TOTAL_CALLS, hex: PALETTE.calls },
    { label: 'dates we went on', value: totalDates, hex: PALETTE.dates },
    { label: 'photos we took', value: totalPhotos, hex: PALETTE.photos },
    { label: 'problems we solved together', value: totalProblems, hex: PALETTE.problems },
  ]

  return (
    <section className="section analytics" id="analytics">
      <p className="section-eyebrow">05 · the analytics</p>
      <h2 className="section-title">Our love, in data</h2>
      <p className="section-lead">
        Every month with you, measured - because even the little numbers tell a big story.
      </p>

      <div className="stat-grid">
        {statCards.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} color={s.hex} />
        ))}
      </div>

      <div className="charts-grid">
        <ChartCard title="Fights per month" sub="the ups and downs. spoiler: fewer every month">
          <Bar
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Fights',
                  data: fights,
                  backgroundColor: fights.map((v) => (v === 0 ? 'rgba(225,29,99,0.25)' : PALETTE.fights)),
                  borderRadius: 8,
                  barPercentage: 0.6,
                },
              ],
            }}
            options={chartOptions}
          />
        </ChartCard>

        <ChartCard title="Long-distance days" sub="time zones between us, still closer than ever">
          <Line
            data={{
              labels: months,
              datasets: [
                {
                  label: 'LD days',
                  data: distance,
                  borderColor: PALETTE.distance,
                  backgroundColor: (c) => gradientFill(c, PALETTE.distance),
                  fill: true,
                  tension: 0.4,
                  pointRadius: 3,
                  pointHoverRadius: 5,
                },
              ],
            }}
            options={chartOptions}
          />
        </ChartCard>

        <ChartCard title="Dates we went on" sub="every one my favourite date">
          <Bar
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Dates',
                  data: dates,
                  backgroundColor: dates.map((v, i) => `hsla(${330 - i * 4}, 85%, 60%, 0.85)`),
                  borderRadius: 8,
                  barPercentage: 0.6,
                },
              ],
            }}
            options={chartOptions}
          />
        </ChartCard>

        <ChartCard title="Photos of us" sub="proof of how photogenic we are together">
          <Line
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Photos',
                  data: photos,
                  borderColor: PALETTE.photos,
                  backgroundColor: (c) => gradientFill(c, PALETTE.photos),
                  fill: true,
                  tension: 0.4,
                  pointRadius: 3,
                  pointHoverRadius: 5,
                },
              ],
            }}
            options={chartOptions}
          />
        </ChartCard>

        <ChartCard title="Problems solved together" sub="us vs. the problem, and we always win">
          <Bar
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Solved',
                  data: problems,
                  backgroundColor: problems.map((v) => (v === 0 ? 'rgba(16,185,129,0.3)' : PALETTE.problems)),
                  borderRadius: 8,
                  barPercentage: 0.6,
                },
              ],
            }}
            options={chartOptions}
          />
        </ChartCard>

        <ChartCard title="Love-o-meter" sub="days i loved you crazy vs days together: 100% matched">
          <div className="love-meter">
            <div className="love-meter-bar">
              <div className="love-meter-fill" style={{ width: '100%' }} />
            </div>
            <div className="love-meter-label">
              <span>{summary.daysLovedCrazy.toLocaleString()} days</span>
              <span>100.0%</span>
            </div>
            <p className="love-meter-note">
              verdict: I have loved you every single day since the very beginning of us ... and I always will.
            </p>
          </div>
        </ChartCard>
      </div>
    </section>
  )
}