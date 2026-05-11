import { useEffect, useState, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  DatePicker,
  Select,
  Spin,
  Typography,
  Space,
  Table,
  Tag,
  Divider,
  Flex,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { DualAxes, Column, Pie } from "@ant-design/charts";
import { reportServices } from "../../components/services/reportServices";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
};

const STATUS_COLORS = {
  pending: "#faad14",
  confirmed: "#1677ff",
  shipped: "#722ed1",
  delivered: "#52c41a",
  cancelled: "#ff4d4f",
};

const PAYMENT_LABELS = {
  cod: "COD",
  vnpay: "VNPay",
  momo: "MoMo",
  banking: "Chuyển khoản",
  unknown: "Không rõ",
  paid: "Đã thanh toán",
  unpaid: "Chưa thanh toán",
  refunded: "Đã hoàn tiền",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShort(v) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v;
}

/* ── Icon Badge (circular colored background like reference) ── */
function IconBadge({ icon, color, bg }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}

/* ── KPI Card matching reference design ── */
function KpiCard({ title, value, icon, color, bg }) {
  return (
    <Card
      bordered
      style={{
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        height: "100%",
      }}
      styles={{ body: { padding: "20px 24px" } }}
    >
      <Flex justify="space-between" align="flex-start">
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, lineHeight: 1.2 }}>
            {value}
          </div>
        </div>
        <IconBadge icon={icon} color={color} bg={bg} />
      </Flex>
    </Card>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <Divider orientation="left" style={{ borderColor: "#e8e8e8", margin: "28px 0 20px" }}>
      <Space>
        {icon}
        <Text strong style={{ fontSize: 16 }}>{children}</Text>
      </Space>
    </Divider>
  );
}

function EmptyChart() {
  return (
    <Flex justify="center" align="center" style={{ height: 300, color: "#bfbfbf" }}>
      <Space direction="vertical" align="center">
        <BarChartOutlined style={{ fontSize: 48 }} />
        <Text type="secondary">Không có dữ liệu trong khoảng thời gian này</Text>
      </Space>
    </Flex>
  );
}

const categoryColumns = [
  { title: "Danh mục", dataIndex: "category", key: "category" },
  {
    title: "Doanh thu",
    dataIndex: "revenue",
    key: "revenue",
    render: (v) => formatCurrency(v),
    sorter: (a, b) => a.revenue - b.revenue,
    defaultSortOrder: "descend",
    align: "right",
  },
  {
    title: "Số lượng bán",
    dataIndex: "quantity",
    key: "quantity",
    sorter: (a, b) => a.quantity - b.quantity,
    align: "right",
  },
  {
    title: "Số đơn hàng",
    dataIndex: "orderCount",
    key: "orderCount",
    sorter: (a, b) => a.orderCount - b.orderCount,
    align: "right",
  },
];

function Report() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [orderStatsData, setOrderStatsData] = useState([]);

  const [dateRange, setDateRange] = useState(null);
  const [groupBy, setGroupBy] = useState("daily");

  const buildParams = useCallback(() => {
    const params = { group: groupBy };
    if (dateRange?.[0] && dateRange?.[1]) {
      params.from = dateRange[0].format("YYYY-MM-DD");
      params.to = dateRange[1].format("YYYY-MM-DD");
    }
    return params;
  }, [dateRange, groupBy]);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await reportServices.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("Lỗi tải dashboard:", err);
    }
  }, []);

  const fetchCharts = useCallback(async () => {
    const params = buildParams();
    try {
      const [revenue, category, payment, orders] = await Promise.all([
        reportServices.getRevenue(params),
        reportServices.getRevenueByCategory(params),
        reportServices.getRevenueByPayment(params),
        reportServices.getOrderStats(params),
      ]);
      setRevenueData(revenue.data || []);
      setCategoryData(category.data || []);
      setPaymentData(payment.data || []);
      setOrderStatsData(orders.data || []);
      console.log(revenue.data, category.data, payment.data, orders.data);
    } catch (err) {
      console.error("Lỗi tải biểu đồ:", err);
    }
  }, [buildParams]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchCharts()]);
      setLoading(false);
    };
    init();
  }, [fetchDashboard, fetchCharts]);

  // ── Chart configs ──

  const dualAxesConfig = {
    data: revenueData,
    xField: "date",
    children: [
      {
        type: "interval",
        yField: "revenue",
        colorField: () => "Doanh thu",
        style: {
          fill: "#1677ff",
          maxWidth: 40,
          radiusTopLeft: 4,
          radiusTopRight: 4,
        },
        axis: {
          y: {
            title: "Doanh thu (VNĐ)",
            labelFormatter: (v) => formatShort(Number(v)),
          },
        },
      },
      {
        type: "line",
        yField: "orderCount",
        colorField: () => "Số đơn hàng",
        style: { stroke: "#ff4d4f", lineWidth: 3 },
        point: {
          shapeField: "circle",
          sizeField: 4,
          style: { fill: "#ff4d4f" },
        },
        scale: { y: { independent: true } },
        axis: {
          y: {
            position: "right",
            title: "Số đơn",
            grid: null,
          },
        },
      },
    ],
  
    // ✅ FIX CHUẨN Ở ĐÂY
    tooltip: {
      formatter: (datum) => {
        if ("revenue" in datum) {
          return {
            name: "Doanh thu",
            value: formatCurrency(datum.revenue),
          };
        }
        if ("orderCount" in datum) {
          return {
            name: "Số đơn hàng",
            value: `${datum.orderCount} đơn`,
          };
        }
        return datum;
      },
    },
  
    height: 340,
  };

  const categoryPieConfig = {
    data: categoryData,
    angleField: "revenue",
    colorField: "category",
    innerRadius: 0.6,
    label: {
      text: "category",
      position: "outside",
    },
    tooltip: {
      title: "category",
      items: [{ field: "revenue", formatter: (v) => formatCurrency(v) }],
    },
    annotations: [
      {
        type: "text",
        style: {
          text: `Tổng\n${formatShort(categoryData.reduce((s, i) => s + i.revenue, 0))} đ`,
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 16,
          fontWeight: "bold",
        },
      },
    ],
    height: 340,
  };
  const orderColumnData = [];
  const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  for (const item of orderStatsData) {
    for (const s of STATUSES) {
      if (item[s]) {
        orderColumnData.push({
          date: item.date,
          count: item[s],
          status: STATUS_LABELS[s] || s,
        });
      }
    }
  }

  const orderColumnConfig = {
    data: orderColumnData,
    xField: "date",
    yField: "count",
    seriesField: "status",
    isStack: true,
    color: ["#faad14", "#1677ff", "#722ed1", "#52c41a", "#ff4d4f"],
    xAxis: { label: { autoRotate: true } },
    label: { position: "middle", style: { fill: "#fff", fontSize: 11 } },
    tooltip: {
      formatter: (datum) => ({ name: datum.status, value: `${datum.count} đơn` }),
    },
    height: 340,
  };

  const paymentPieMapped = paymentData.map((p) => ({
    ...p,
    label: PAYMENT_LABELS[p.paymentMethod] || p.paymentMethod,
  }));

  const paymentPieConfig = {
    data: paymentPieMapped,
    angleField: "revenue",
    colorField: "label",
    innerRadius: 0.6,
    label: {
      text: "label",
      position: "outside",
    },
    tooltip: {
      title: "label",
      items: [{ field: "revenue", formatter: (v) => formatCurrency(v) }],
    },
    annotations: [
      {
        type: "text",
        style: {
          text: `Tổng\n${formatShort(paymentData.reduce((s, i) => s + i.revenue, 0))} đ`,
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 16,
          fontWeight: "bold",
        },
      },
    ],
    height: 340,
  };

  // ── Render ──

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 400 }}>
        <Spin size="large" tip="Đang tải dữ liệu báo cáo..." />
      </Flex>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>

      {/* ═══════════════ HEADER + FILTER ═══════════════ */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Báo cáo & Thống kê</Title>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            allowClear
            presets={[
              { label: "7 ngày qua", value: [dayjs().subtract(7, "day"), dayjs()] },
              { label: "30 ngày qua", value: [dayjs().subtract(30, "day"), dayjs()] },
              { label: "Tháng này", value: [dayjs().startOf("month"), dayjs()] },
              { label: "Tháng trước", value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
            ]}
          />
          <Select
            value={groupBy}
            onChange={setGroupBy}
            style={{ width: 140 }}
            options={[
              { label: "Theo ngày", value: "daily" },
              { label: "Theo tuần", value: "weekly" },
              { label: "Theo tháng", value: "monthly" },
            ]}
          />
        </Space>
      </Flex>

      {/* ═══════════════ ROW 1: 4 KPI CARDS ═══════════════ */}
      {dashboard && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <KpiCard
              title="Tổng doanh thu"
              value={formatCurrency(dashboard.totalRevenue)}
              icon={<DollarOutlined />}
              color="#1677ff"
              bg="#e6f7ff"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KpiCard
              title="Tổng đơn hàng"
              value={dashboard.totalOrders.toLocaleString("vi-VN")}
              icon={<ShoppingCartOutlined />}
              color="#722ed1"
              bg="#f9f0ff"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KpiCard
              title="Doanh thu hôm nay"
              value={formatCurrency(dashboard.todayRevenue)}
              icon={<RiseOutlined />}
              color="#52c41a"
              bg="#f6ffed"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KpiCard
              title="Giá trị TB / đơn"
              value={formatCurrency(dashboard.avgOrderValue)}
              icon={<CalendarOutlined />}
              color="#fa8c16"
              bg="#fff7e6"
            />
          </Col>
        </Row>
      )}

      {/* ═══════════════ ROW 2: DUAL AXES + CATEGORY PIE ═══════════════ */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            title="Doanh thu & Đơn hàng"
            style={{ borderRadius: 12, height: "100%" }}
            styles={{ body: { paddingTop: 12 } }}
          >
            {revenueData.length > 0 ? <DualAxes {...dualAxesConfig} /> : <EmptyChart />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="Cơ cấu danh mục"
            style={{ borderRadius: 12, height: "100%" }}
            styles={{ body: { paddingTop: 12 } }}
          >
            {categoryData.length > 0 ? <Pie {...categoryPieConfig} /> : <EmptyChart />}
          </Card>
        </Col>
      </Row>

      {/* ═══════════════ ROW 3: STATUS TAGS ═══════════════ */}
      {dashboard && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <Card size="small" title="Trạng thái đơn hàng" style={{ borderRadius: 12, height: "100%" }}>
              <Space wrap size={[8, 8]}>
                {Object.entries(dashboard.statusBreakdown || {}).map(([key, val]) => (
                  <Tag key={key} color={STATUS_COLORS[key] || "default"} style={{ fontSize: 13, padding: "4px 12px" }}>
                    {STATUS_LABELS[key] || key}: <strong>{val}</strong>
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Trạng thái thanh toán" style={{ borderRadius: 12, height: "100%" }}>
              <Space wrap size={[8, 8]}>
                {Object.entries(dashboard.paymentBreakdown || {}).map(([key, val]) => (
                  <Tag key={key} color="blue" style={{ fontSize: 13, padding: "4px 12px" }}>
                    {PAYMENT_LABELS[key] || key}: <strong>{val}</strong>
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* ═══════════════ ROW 4: ORDER STATS + PAYMENT PIE ═══════════════ */}
      <SectionTitle icon={<ShoppingCartOutlined />}>Phân tích đơn hàng</SectionTitle>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Đơn hàng theo trạng thái"
            style={{ borderRadius: 12, height: "100%" }}
            styles={{ body: { paddingTop: 12 } }}
          >
            {orderColumnData.length > 0 ? <Column {...orderColumnConfig} /> : <EmptyChart />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="Doanh thu theo thanh toán"
            style={{ borderRadius: 12, height: "100%" }}
            styles={{ body: { paddingTop: 12 } }}
          >
            {paymentData.length > 0 ? <Pie {...paymentPieConfig} /> : <EmptyChart />}
          </Card>
        </Col>
      </Row>

      {/* ═══════════════ ROW 5: DETAIL TABLE ═══════════════ */}
      <SectionTitle icon={<BarChartOutlined />}>Chi tiết doanh thu theo danh mục</SectionTitle>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Table
          dataSource={categoryData}
          columns={categoryColumns}
          rowKey="category"
          pagination={false}
          size="middle"
          summary={(data) => {
            const totalRev = data.reduce((s, r) => s + r.revenue, 0);
            const totalQty = data.reduce((s, r) => s + r.quantity, 0);
            const totalOrd = data.reduce((s, r) => s + r.orderCount, 0);
            return (
              <Table.Summary.Row style={{ fontWeight: 600, background: "#fafafa" }}>
                <Table.Summary.Cell>Tổng cộng</Table.Summary.Cell>
                <Table.Summary.Cell align="right">{formatCurrency(totalRev)}</Table.Summary.Cell>
                <Table.Summary.Cell align="right">{totalQty}</Table.Summary.Cell>
                <Table.Summary.Cell align="right">{totalOrd}</Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
}

export default Report;
