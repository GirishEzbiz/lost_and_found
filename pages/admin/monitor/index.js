import { FiAlertCircle, FiBarChart2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import { Card, CardBody, CardHeader, Container, Row, Col } from 'react-bootstrap';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer
} from 'recharts';

export default function MonitorPage() {
    const [mData, setMData] = useState([]);
    const [metrics, setMetrics] = useState({ total: 0, correct: 0, delayed: 0, errors: 0 });
    const [barData, setBarData] = useState([]);
    const [hydrated, setHydrated] = useState(false);
    const seenTimestamps = useRef(new Set());

    useEffect(() => {
        setHydrated(true); // Ensures rendering happens only on the client
    }, []);

    const fetchLiveData = async () => {
        const res = await fetch("/api/admin/monitorLogger");
        const { data } = await res.json();
        if (!data || !data.length) return;

        let total = 0, delayed = 0, errors = 0;
        let latestTimestamp = null;

        const urlPatterns = [
            { label: 'User Dashboard', keyword: '/user/userDetails' },
            { label: 'Admin Panel', keyword: '/admin/dashboard' },
            { label: 'Batches', keyword: '/api/admin/batchs' },
            { label: 'Teams', keyword: '/admin/admin' },
            { label: 'User Registrations', keyword: '/admin/registration' }
        ];

        let urlCounts = {};
        urlPatterns.forEach(pattern => {
            urlCounts[pattern.label] = 0;
        });

        data.forEach(log => {
            const ts = new Date(log.timestamp).toLocaleTimeString();

            if (seenTimestamps.current.has(ts)) return;
            seenTimestamps.current.add(ts);
            latestTimestamp = ts;

            if (log.status >= 400) errors++;
            if (log.duration > 300) delayed++;
            total++;

            // Only count URL matches for new (unique) timestamps
            urlPatterns.forEach(pattern => {
                if (log.url.includes(pattern.keyword)) {
                    urlCounts[pattern.label]++;
                }
            });
        });


        // Fallback to current time if no new logs found
        if (!latestTimestamp) {
            latestTimestamp = new Date().toLocaleTimeString();
        }

        // Calculate correct (even if total is 0)
        const correct = total - delayed - errors;

        // Always push a point—even if it's 0s
        const point = { time: latestTimestamp, errors, delayed, correct, total };

        setMetrics(prev => ({
            total: prev.total + total,
            correct: prev.correct + correct,
            delayed: prev.delayed + delayed,
            errors: prev.errors + errors
        }));

        setMData(prev => {
            const updated = [...prev, point];
            return updated.length > 60 ? updated.slice(-60) : updated;
        });



        setBarData(prev => {
            const updated = { ...Object.fromEntries(prev.map(d => [d.name, d.value])) };

            Object.entries(urlCounts).forEach(([label, count]) => {
                updated[label] = (updated[label] || 0) + count;
            });

            return Object.entries(updated).map(([name, value]) => ({ name, value }));
        });


    };

    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 30000);
        return () => clearInterval(interval);
    }, []);

    const pieData = [
        { name: 'Correct Requests', value: metrics.correct, color: '#4caf50' },
        { name: 'Delayed Requests', value: metrics.delayed, color: '#ff9800' },
        { name: 'Error Requests', value: metrics.errors, color: '#f44336' }
    ];

    if (!hydrated) return null;

    return (
        <Container fluid className="p-4 bg-light">
            <Row className="mb-4">
                <Col md={9}>
                    <Card className="shadow-sm border-0">
                        <CardHeader className="bg-white fw-bold">📈 API Error & Delay Graph</CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={mData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 'auto']} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="errors" stroke="#f5222d" name="Errors" isAnimationActive={true} animationDuration={500} />
                                    <Line type="monotone" dataKey="delayed" stroke="#fa8c16" name="Delayed" isAnimationActive={true} animationDuration={500} />
                                    <Line type="monotone" dataKey="total" stroke="#1890ff" name="Total" isAnimationActive={true} animationDuration={500} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={3}>
                    <div className="bg-white shadow-sm rounded p-3 h-100">
                        <h5 className="fw-bold mb-3">🧾 Key Metrics</h5>
                        <Row className="g-3">
                            <Col xs={6}>
                                <div className="border rounded text-center p-3 bg-light">
                                    <FiBarChart2 size={32} className="text-primary" />
                                    <h6 className="mt-2 text-muted ">Total</h6>
                                    <h4 className="fw-bold text-primary">{metrics.total}</h4>
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div className="border rounded text-center p-3 bg-light">
                                    <FiCheckCircle size={32} className="text-success" />
                                    <h6 className="mt-2 text-muted">Correct</h6>
                                    <h4 className="fw-bold text-success">{metrics.correct}</h4>
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div className="border rounded text-center p-3 bg-light">
                                    <FiAlertCircle size={32} className="text-warning" />
                                    <h6 className="mt-2 text-muted">Delayed</h6>
                                    <h4 className="fw-bold text-warning">{metrics.delayed}</h4>
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div className="border rounded text-center p-3 bg-light">
                                    <FiXCircle size={32} className="text-danger" />
                                    <h6 className="mt-2 text-muted">Errors</h6>
                                    <h4 className="fw-bold text-danger">{metrics.errors}</h4>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0">
                        <CardHeader className="bg-white fw-bold">📊 Request Distribution</CardHeader>
                        <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={pieData.map(item => ({
        ...item,
        percentage: metrics.total > 0 ? ((item.value / metrics.total) * 100).toFixed(1) : 0
      }))}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={90} // slightly smaller
      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
          <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            style={{ pointerEvents: 'none' }}
          >
            {`${pieData[index].name.split(' ')[0]} ${percent ? (percent * 100).toFixed(0) : 0}%`}
          </text>
        );
      }}
      labelLine={false}
      isAnimationActive={true}
      animationDuration={800}
    >
      {pieData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip
      formatter={(value, name) => [`${value} Requests`, name]}
      contentStyle={{ backgroundColor: '#fff', borderColor: '#ccc' }}
    />
    <Legend verticalAlign="bottom" height={36} />
  </PieChart>
</ResponsiveContainer>


                        </CardBody>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="shadow-sm border-0">
                        <CardHeader className="bg-white fw-bold">📊 API Usage by URL</CardHeader>
                        <CardBody>
                            <BarChart width={750} height={300} data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value">
                                    {barData.map((entry, index) => (
                                        <Cell key={`bar-${index}`} fill={['#1890ff', '#13c2c2', '#52c41a', '#fa8c16', '#f5222d'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
