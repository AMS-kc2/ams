interface DashboardHeaderProps {
  lecturerName: string;
}

export const DashboardHeader = ({ lecturerName }: DashboardHeaderProps) => {
  return (
    <div className="border-b bg-card/50 backdrop-blur-sm p-6 mb-8 rounded-lg shadow-sm">
      <p className="text-xl font-semibold text-muted-foreground">
        Welcome back,
      </p>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        DR. {lecturerName}
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        Manage attendance for your courses with ease.
      </p>
    </div>
  );
};