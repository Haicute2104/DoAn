import { Spin } from "antd";

export default function SpinComponent({ content }) {
  return (
    <Spin description="Loading" size="large">
      {content}
    </Spin>
  );
}