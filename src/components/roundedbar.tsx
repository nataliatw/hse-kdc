export const RoundedBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  
  // Sesuaikan radius berdasarkan tinggi
  const radius = Math.min(15, height / 2);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={radius}
        ry={radius}
      />
    </g>
  );
};
