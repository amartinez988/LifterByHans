import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Row,
  Column,
} from "@react-email/components";

const baseUrl = process.env.NEXTAUTH_URL || "https://uplio.app";

// Common styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  marginBottom: "64px",
  borderRadius: "12px",
  overflow: "hidden" as const,
  border: "1px solid #e2e8f0",
};

const header = {
  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  padding: "32px 48px",
  textAlign: "center" as const,
};

const content = {
  padding: "32px 48px",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "1.3",
};

const subheading = {
  color: "rgba(255,255,255,0.8)",
  fontSize: "14px",
  margin: "8px 0 0 0",
};

const paragraph = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

const footer = {
  padding: "24px 48px",
  borderTop: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
};

const footerText = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "0",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
};

const statCard = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
};

const statValue = {
  color: "#1e293b",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const statLabel = {
  color: "#64748b",
  fontSize: "12px",
  margin: "4px 0 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

// ============================================
// Inspection Reminder Email
// ============================================

interface InspectionReminderProps {
  recipientName: string;
  companyName: string;
  unitIdentifier: string;
  buildingName: string;
  buildingAddress: string;
  expirationDate: string;
  daysUntilExpiration: number;
  inspectionCode?: string;
}

export function InspectionReminderEmail({
  recipientName,
  companyName,
  unitIdentifier,
  buildingName,
  buildingAddress,
  expirationDate,
  daysUntilExpiration,
  inspectionCode,
}: InspectionReminderProps) {
  const urgencyColor = daysUntilExpiration <= 7 ? "#ef4444" : 
                       daysUntilExpiration <= 14 ? "#f59e0b" : "#4f46e5";

  return (
    <Html>
      <Head />
      <Preview>Inspection expiring soon for {unitIdentifier} at {buildingName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, background: `linear-gradient(135deg, ${urgencyColor}, #7c3aed)` }}>
            <Heading style={heading}>⚠️ Inspection Reminder</Heading>
            <Text style={subheading}>{companyName}</Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {recipientName},</Text>
            
            <Text style={paragraph}>
              This is a reminder that an inspection certificate is expiring soon:
            </Text>

            <Section style={{ margin: "24px 0" }}>
              <Row>
                <Column style={{ width: "50%", paddingRight: "8px" }}>
                  <div style={statCard}>
                    <Text style={{ ...statValue, color: urgencyColor }}>{daysUntilExpiration}</Text>
                    <Text style={statLabel}>Days Remaining</Text>
                  </div>
                </Column>
                <Column style={{ width: "50%", paddingLeft: "8px" }}>
                  <div style={statCard}>
                    <Text style={statValue}>{expirationDate}</Text>
                    <Text style={statLabel}>Expiration Date</Text>
                  </div>
                </Column>
              </Row>
            </Section>

            <div style={{ backgroundColor: "#f8fafc", borderRadius: "8px", padding: "20px", margin: "24px 0" }}>
              <Text style={{ ...paragraph, fontWeight: "bold", margin: "0 0 8px 0" }}>
                Unit Details
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0" }}>
                <strong>Unit:</strong> {unitIdentifier}
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0" }}>
                <strong>Building:</strong> {buildingName}
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0" }}>
                <strong>Address:</strong> {buildingAddress}
              </Text>
              {inspectionCode && (
                <Text style={{ ...paragraph, margin: "4px 0" }}>
                  <strong>Inspection Code:</strong> {inspectionCode}
                </Text>
              )}
            </div>

            <Text style={paragraph}>
              Please schedule a new inspection before the expiration date to maintain compliance.
            </Text>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button href={`${baseUrl}/app/inspections/new`} style={button}>
                Schedule Inspection
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Sent by {companyName} via Uplio • {baseUrl}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================
// Job Status Update Email
// ============================================

interface JobStatusUpdateProps {
  recipientName: string;
  companyName: string;
  jobCode: string;
  jobTitle: string;
  oldStatus: string;
  newStatus: string;
  buildingName: string;
  buildingAddress: string;
  unitIdentifier?: string;
  mechanicName?: string;
  scheduledDate: string;
  notes?: string;
}

export function JobStatusUpdateEmail({
  recipientName,
  companyName,
  jobCode,
  jobTitle,
  oldStatus,
  newStatus,
  buildingName,
  buildingAddress,
  unitIdentifier,
  mechanicName,
  scheduledDate,
  notes,
}: JobStatusUpdateProps) {
  const statusColors: Record<string, string> = {
    SCHEDULED: "#4f46e5",
    "EN_ROUTE": "#f59e0b",
    ON_SITE: "#0891b2",
    COMPLETED: "#10b981",
    CANCELLED: "#64748b",
  };

  const statusColor = statusColors[newStatus] || "#4f46e5";

  return (
    <Html>
      <Head />
      <Preview>Job {jobCode} status updated to {newStatus}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>Job Status Update</Heading>
            <Text style={subheading}>{companyName}</Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {recipientName},</Text>
            
            <Text style={paragraph}>
              The status of job <strong>{jobCode}</strong> has been updated.
            </Text>

            <Section style={{ textAlign: "center", margin: "24px 0" }}>
              <div style={{ 
                display: "inline-block", 
                backgroundColor: statusColor,
                color: "#ffffff",
                padding: "8px 24px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                {newStatus.replace("_", " ")}
              </div>
            </Section>

            <div style={{ backgroundColor: "#f8fafc", borderRadius: "8px", padding: "20px", margin: "24px 0" }}>
              <Text style={{ ...paragraph, fontWeight: "bold", margin: "0 0 12px 0" }}>
                {jobTitle}
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                <strong>Job Code:</strong> {jobCode}
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                <strong>Building:</strong> {buildingName}
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                <strong>Address:</strong> {buildingAddress}
              </Text>
              {unitIdentifier && (
                <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                  <strong>Unit:</strong> {unitIdentifier}
                </Text>
              )}
              {mechanicName && (
                <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                  <strong>Assigned To:</strong> {mechanicName}
                </Text>
              )}
              <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                <strong>Scheduled:</strong> {scheduledDate}
              </Text>
            </div>

            {notes && (
              <div style={{ backgroundColor: "#fef3c7", borderRadius: "8px", padding: "16px", margin: "24px 0" }}>
                <Text style={{ ...paragraph, margin: "0", fontSize: "14px" }}>
                  <strong>Notes:</strong> {notes}
                </Text>
              </div>
            )}

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button href={`${baseUrl}/app/jobs`} style={button}>
                View Job Details
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Sent by {companyName} via Uplio • {baseUrl}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================
// Emergency Call Alert Email
// ============================================

interface EmergencyCallAlertProps {
  recipientName: string;
  companyName: string;
  emergencyCode: string;
  buildingName: string;
  buildingAddress: string;
  unitIdentifier: string;
  issueDescription: string;
  callInTime: string;
  assignedMechanic?: string;
}

export function EmergencyCallAlertEmail({
  recipientName,
  companyName,
  emergencyCode,
  buildingName,
  buildingAddress,
  unitIdentifier,
  issueDescription,
  callInTime,
  assignedMechanic,
}: EmergencyCallAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>🚨 Emergency Call Alert: {emergencyCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
            <Heading style={heading}>🚨 Emergency Call Alert</Heading>
            <Text style={subheading}>{companyName}</Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {recipientName},</Text>
            
            <Text style={paragraph}>
              A new emergency call has been logged and requires immediate attention:
            </Text>

            <div style={{ 
              backgroundColor: "#fef2f2", 
              border: "1px solid #fecaca",
              borderRadius: "8px", 
              padding: "20px", 
              margin: "24px 0" 
            }}>
              <Text style={{ ...paragraph, fontWeight: "bold", color: "#dc2626", margin: "0 0 12px 0" }}>
                Emergency Code: {emergencyCode}
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                <strong>Call Time:</strong> {callInTime}
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                <strong>Building:</strong> {buildingName}
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                <strong>Address:</strong> {buildingAddress}
              </Text>
              <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                <strong>Unit:</strong> {unitIdentifier}
              </Text>
              {assignedMechanic && (
                <Text style={{ ...paragraph, margin: "4px 0", fontSize: "14px" }}>
                  <strong>Assigned:</strong> {assignedMechanic}
                </Text>
              )}
            </div>

            <div style={{ backgroundColor: "#f8fafc", borderRadius: "8px", padding: "16px", margin: "24px 0" }}>
              <Text style={{ ...paragraph, fontWeight: "bold", margin: "0 0 8px 0" }}>
                Issue Description
              </Text>
              <Text style={{ ...paragraph, margin: "0" }}>
                {issueDescription}
              </Text>
            </div>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button href={`${baseUrl}/app/emergency-calls`} style={{ ...button, backgroundColor: "#dc2626" }}>
                View Emergency Call
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Sent by {companyName} via Uplio • {baseUrl}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================
// Weekly Summary Email
// ============================================

interface WeeklySummaryProps {
  recipientName: string;
  companyName: string;
  weekStartDate: string;
  weekEndDate: string;
  stats: {
    jobsCompleted: number;
    jobsScheduled: number;
    maintenanceCompleted: number;
    emergencyCalls: number;
    inspectionsDue: number;
    complianceRate: number;
  };
}

export function WeeklySummaryEmail({
  recipientName,
  companyName,
  weekStartDate,
  weekEndDate,
  stats,
}: WeeklySummaryProps) {
  return (
    <Html>
      <Head />
      <Preview>Weekly Summary for {companyName}: {weekStartDate} - {weekEndDate}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>📊 Weekly Summary</Heading>
            <Text style={subheading}>
              {weekStartDate} - {weekEndDate}
            </Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {recipientName},</Text>
            
            <Text style={paragraph}>
              Here&apos;s your weekly operations summary for <strong>{companyName}</strong>:
            </Text>

            <Section style={{ margin: "24px 0" }}>
              <Row>
                <Column style={{ width: "33.33%", paddingRight: "8px" }}>
                  <div style={statCard}>
                    <Text style={{ ...statValue, color: "#10b981" }}>{stats.jobsCompleted}</Text>
                    <Text style={statLabel}>Jobs Completed</Text>
                  </div>
                </Column>
                <Column style={{ width: "33.33%", paddingLeft: "4px", paddingRight: "4px" }}>
                  <div style={statCard}>
                    <Text style={{ ...statValue, color: "#4f46e5" }}>{stats.jobsScheduled}</Text>
                    <Text style={statLabel}>Jobs Scheduled</Text>
                  </div>
                </Column>
                <Column style={{ width: "33.33%", paddingLeft: "8px" }}>
                  <div style={statCard}>
                    <Text style={{ ...statValue, color: "#0891b2" }}>{stats.maintenanceCompleted}</Text>
                    <Text style={statLabel}>Maintenance</Text>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section style={{ margin: "24px 0" }}>
              <Row>
                <Column style={{ width: "33.33%", paddingRight: "8px" }}>
                  <div style={statCard}>
                    <Text style={{ ...statValue, color: "#ef4444" }}>{stats.emergencyCalls}</Text>
                    <Text style={statLabel}>Emergency Calls</Text>
                  </div>
                </Column>
                <Column style={{ width: "33.33%", paddingLeft: "4px", paddingRight: "4px" }}>
                  <div style={statCard}>
                    <Text style={{ ...statValue, color: "#f59e0b" }}>{stats.inspectionsDue}</Text>
                    <Text style={statLabel}>Inspections Due</Text>
                  </div>
                </Column>
                <Column style={{ width: "33.33%", paddingLeft: "8px" }}>
                  <div style={statCard}>
                    <Text style={{ ...statValue, color: stats.complianceRate >= 80 ? "#10b981" : stats.complianceRate >= 50 ? "#f59e0b" : "#ef4444" }}>
                      {stats.complianceRate}%
                    </Text>
                    <Text style={statLabel}>Compliance</Text>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button href={`${baseUrl}/app/analytics`} style={button}>
                View Full Analytics
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Sent by {companyName} via Uplio • {baseUrl}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
