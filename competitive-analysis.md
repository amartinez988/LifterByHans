# Lifter Competitive Analysis (January 2026)

## Market Size
- **Elevator maintenance market**: $33.45B (2024) → $61.12B (2032)
- **CAGR**: 8%
- **Key trends**: Preventive/predictive maintenance, IoT integration, compliance automation

---

## Direct Competitors

### Tier 1: Elevator-Specific FSM

| Competitor | Pricing | Key Strengths | Weaknesses |
|------------|---------|---------------|------------|
| **FIELDBOSS** | Enterprise | Built on Microsoft Dynamics, full ERP, elevator-specific checklists, safety test management | Complex, expensive, enterprise-focused |
| **LiftKeeper** | Contact vendor | Elevator-only, service history, contract billing, route management | No mobile app, limited visibility |
| **Fieldy** | ~$24/user/mo | AMC automation, predictive scheduling, real-time tracking, compliance | Newer player, less established |

### Tier 2: General FSM (adapted for elevator)

| Competitor | Pricing | Key Strengths | Weaknesses |
|------------|---------|---------------|------------|
| **ServiceTitan** | $300+/mo | Industry leader, real-time dispatch, call recording, service agreements | Expensive, complex, overkill for SMBs |
| **Jobber** | $19/mo+ | Simple, affordable, client management, invoicing, QuickBooks integration | No elevator-specific compliance, limited AMC |
| **Method** | $15/user/mo | QuickBooks integration, employee scheduling, invoicing | Basic, no predictive features |
| **WorkWave** | Contact vendor | Scheduling, customer tracking, cost estimation | Generic |
| **Field Force Tracker** | $99.99/mo | Work order management, inventory, timesheet tracking | Basic UI, no elevator specifics |
| **Zoho FSM** | Affordable | Scheduling, ecosystem integration | Manual compliance workarounds |
| **IFS Field Service** | Enterprise | Advanced analytics, asset lifecycle | Complex, expensive, needs IT team |

### Tier 3: Safety/Compliance Platforms

| Competitor | Pricing | Key Strengths | Weaknesses |
|------------|---------|---------------|------------|
| **SafetyCulture** | $24/seat/mo | Digital checklists, asset tracking, training, lone worker features | Not elevator-focused, general purpose |

---

## Critical Features Competitors Offer (Lifter Gap Analysis)

### ✅ Lifter Has
- Multi-tenant workspaces
- Management companies, buildings, units
- Mechanics & maintenance tracking
- Inspections & inspectors
- Emergency call logging
- Compliance dashboard & alerts
- Team management with roles

### ❌ Lifter Needs (Priority Order)

**Phase 9 Priorities:**
1. **📱 Scheduling & Dispatch**
   - Calendar view (day/week/month)
   - Mechanic availability tracking
   - Job assignment with time slots
   - Status workflow (Scheduled → En Route → On Site → Complete)
   - Drag-and-drop rescheduling

2. **📋 Digital Checklists/Forms**
   - State-specific inspection templates (ASME A17.1)
   - Safety test checklists
   - Photo/signature capture
   - Offline support

3. **🔔 Automated Reminders**
   - Inspection due dates
   - AMC renewal alerts
   - Maintenance interval warnings
   - Email/SMS notifications

**Future Phases:**
4. **💰 Quoting & Invoicing**
   - Generate quotes from jobs
   - Invoice generation
   - Payment tracking
   - QuickBooks integration

5. **📱 Mobile App / PWA**
   - Field technician access
   - Offline-capable
   - Push notifications
   - Photo upload

6. **📊 Reporting & Analytics**
   - Mechanic utilization
   - Job profitability
   - Response time KPIs
   - Contract performance

7. **🏷️ Inventory/Parts Management**
   - Track parts per job
   - Stock alerts
   - Purchase orders

8. **📍 GPS/Route Optimization**
   - Real-time technician tracking
   - Dispatch nearest mechanic
   - Route planning

9. **🤖 Predictive Maintenance**
   - IoT sensor integration
   - Failure prediction
   - Smart scheduling

---

## Lifter's Competitive Advantages

1. **Modern Stack** - Next.js/React vs legacy .NET/Java competitors
2. **Vertical Focus** - Built for elevator industry, not generic FSM
3. **SMB-Friendly** - Can undercut ServiceTitan/FIELDBOSS pricing
4. **Compliance-First** - Inspections, emergency calls, alerts are core
5. **Clean UX** - Simple, fast, mobile-friendly

---

## Recommended Phase 9 Focus

**Scheduling & Dispatch Module**
- This is the #1 gap between Lifter and competitors
- Enables real operational workflow (not just record-keeping)
- Builds on existing Mechanic and Maintenance modules
- Foundation for future mobile app

**Key entities to add:**
- `ScheduledJob` - A planned work assignment
- `MechanicAvailability` - Time blocks when mechanic is available
- `JobStatus` - Extended status workflow
- Calendar UI with drag-and-drop

---

*Last updated: January 28, 2026*
