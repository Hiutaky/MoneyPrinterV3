type Props = {
    height?: number;
};

export const Skeleton: React.FC<Props> = ({ height = 28 }) => {
    return (
        <div
            className="bg-slate-200 rounded animate-pulse w-full"
            style={{
                height: `${height}px`,
            }}
        ></div>
    );
};

export default Skeleton;
