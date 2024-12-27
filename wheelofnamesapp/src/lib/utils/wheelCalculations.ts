export const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

export const getSegmentPath = (index: number, total: number) => {
  const angle = (360 / total);
  const startAngle = index * angle;
  const endAngle = (index + 1) * angle;
  const start = polarToCartesian(200, 200, 200, startAngle);
  const end = polarToCartesian(200, 200, 200, endAngle);
  const largeArcFlag = angle <= 180 ? "0" : "1";
  
  return `M 200 200 L ${start.x} ${start.y} A 200 200 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

export const getTextPath = (index: number, total: number) => {
  const angle = (360 / total);
  const midAngle = index * angle + angle / 2;
  
  const innerRadius = 80;
  const outerRadius = 180;
  
  const start = polarToCartesian(200, 200, innerRadius, midAngle);
  const end = polarToCartesian(200, 200, outerRadius, midAngle);
  
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
};