/**
 * Example API Route Handler: Get Service Packages
 * File: app/api/services/packages/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication middleware

    // TODO: Fetch from database (Prisma or your ORM)
    // const packages = await db.careServicePackage.findMany({
    //   where: { isActive: true },
    //   select: { ... }
    // });

    // Mock data - remove when database integration is ready
    const packages = [
      {
        id: 1,
        name: "Gói Chăm Sóc Cơ Bản",
        description: "Gói dịch vụ chăm sóc cơ bản cho cây nội thất",
        features: ["Tưới nước", "Vệ sinh lá", "Kiểm tra sâu bệnh"],
        serviceType: "ONETIME",
        frequency: null,
        durationDays: 1,
        difficultyLevel: "EASY",
        areaLimit: 50,
        unitPrice: 200000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication and authorization (Admin only)

    const body = await request.json();

    // TODO: Validate request body using Zod or similar

    // TODO: Create in database
    // const newPackage = await db.careServicePackage.create({
    //   data: body,
    // });

    return NextResponse.json({
      success: true,
      data: body, // Return created package
      message: 'Package created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Example API Route Handler: Service Registration
 * File: app/api/services/register/route.ts
 */
export async function POST_REGISTER(request: NextRequest) {
  try {
    // TODO: Add authentication middleware to get current user

    const body = await request.json();
    const userId = 1; // TODO: Get from authenticated session

    // TODO: Validate request body
    // - servicePackageId exists
    // - address is not empty
    // - phone is valid
    // - serviceDate is in future

    // TODO: Create service registration in database
    // const registration = await db.serviceRegistration.create({
    //   data: {
    //     customerId: userId,
    //     servicePackageId: body.servicePackageId,
    //     address: body.address,
    //     phone: body.phone,
    //     serviceDate: body.serviceDate,
    //     note: body.note,
    //     status: 'PENDING_CONFIRMATION',
    //   },
    // });

    // TODO: Send notification email/SMS to customer

    return NextResponse.json({
      success: true,
      data: {}, // registration
      message: 'Service registered successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Example API Route Handler: Confirm Service Request
 * File: app/api/services/registrations/[id]/confirm/route.ts
 */
export async function POST_CONFIRM(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication and authorization (Staff only)

    const body = await request.json();
    const registrationId = parseInt(params.id);

    // TODO: Validate caretaker exists and is available
    // TODO: Update registration status to CONFIRMED
    // TODO: Assign caretaker
    // TODO: Set estimated duration
    // TODO: Send notification to caretaker
    // TODO: Send confirmation to customer

    return NextResponse.json({
      success: true,
      message: 'Service request confirmed',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Example API Route Handler: Get Available Caretakers
 * File: app/api/services/caretakers/available/route.ts
 */
export async function GET_AVAILABLE_CARETAKERS(request: NextRequest) {
  try {
    // TODO: Add authentication middleware

    // TODO: Fetch caretakers with AVAILABLE status
    // TODO: Include rating and completed services count
    // const caretakers = await db.user.findMany({
    //   where: {
    //     role: 'CARETAKER',
    //     availabilityStatus: 'AVAILABLE',
    //   },
    //   select: { ... }
    // });

    return NextResponse.json({
      success: true,
      data: [], // caretakers
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Example API Route Handler: Get Caretaker Daily Tasks
 * File: app/api/services/caretaker/tasks/route.ts
 */
export async function GET_CARETAKER_TASKS(request: NextRequest) {
  try {
    // TODO: Add authentication and authorization (Caretaker only)

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date'); // YYYY-MM-DD format

    const caretakerId = 1; // TODO: Get from authenticated session

    // TODO: Fetch tasks for current caretaker on given date
    // const tasks = await db.serviceRegistration.findMany({
    //   where: {
    //     mainCaretakerId: caretakerId,
    //     serviceDate: {
    //       gte: new Date(date),
    //       lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
    //     },
    //     status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
    //   },
    //   include: { ... }
    // });

    return NextResponse.json({
      success: true,
      data: [], // tasks
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Example API Route Handler: Submit Service Progress
 * File: app/api/services/registrations/[id]/progress/route.ts
 */
export async function POST_PROGRESS(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication and authorization (Caretaker only)

    const body = await request.json();
    const registrationId = parseInt(params.id);
    const caretakerId = 1; // TODO: Get from authenticated session

    // TODO: Validate action is valid enum value
    // TODO: Create service progress record
    // const progress = await db.serviceProgress.create({
    //   data: {
    //     serviceRegistrationId: registrationId,
    //     caretakerId,
    //     action: body.action,
    //     description: body.description,
    //     evidenceImageUrl: body.evidenceImageUrl,
    //     actualStartTime: body.actualStartTime,
    //     actualEndTime: body.actualEndTime,
    //   },
    // });

    // TODO: If action is CHECK_IN, update registration status to IN_PROGRESS
    // TODO: If action is CHECK_OUT, update registration status to PENDING_REVIEW

    return NextResponse.json({
      success: true,
      message: 'Progress recorded',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Example API Route Handler: Generate Invoice
 * File: app/api/services/registrations/[id]/invoice/route.ts
 */
export async function POST_INVOICE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication and authorization (Staff only)

    const registrationId = parseInt(params.id);

    // TODO: Fetch service registration with package and approved add-ons
    // TODO: Calculate total amount (base + add-ons)
    // TODO: Create invoice record
    // TODO: Update service registration status to COMPLETED
    // TODO: Send invoice to customer

    return NextResponse.json({
      success: true,
      message: 'Invoice generated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Database Schema Recommendations (Prisma)
 * 
 * model CareServicePackage {
 *   id Int @id @default(autoincrement())
 *   name String
 *   description String
 *   features Json // Array of feature strings
 *   serviceType String // ONETIME, PERIODIC
 *   frequency String? // Weekly, Monthly, etc.
 *   durationDays Int
 *   difficultyLevel String // EASY, MEDIUM, HARD, EXPERT
 *   areaLimit Float // in m²
 *   unitPrice Float
 *   isActive Boolean @default(true)
 *   registrations ServiceRegistration[]
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 * }
 * 
 * model ServiceRegistration {
 *   id Int @id @default(autoincrement())
 *   customerId Int
 *   customer User @relation(fields: [customerId], references: [id])
 *   servicePackageId Int
 *   servicePackage CareServicePackage @relation(fields: [servicePackageId], references: [id])
 *   address String
 *   phone String
 *   serviceDate DateTime
 *   note String?
 *   status String // PENDING_CONFIRMATION, CONFIRMED, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED
 *   cancelReason String?
 *   mainCaretakerId Int?
 *   caretaker User? @relation(fields: [mainCaretakerId], references: [id])
 *   estimatedDuration Int? // in minutes
 *   progress ServiceProgress[]
 *   addOns AddOnService[]
 *   invoice ServiceInvoice?
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 * }
 * 
 * model ServiceProgress {
 *   id Int @id @default(autoincrement())
 *   serviceRegistrationId Int
 *   registration ServiceRegistration @relation(fields: [serviceRegistrationId], references: [id])
 *   caretakerId Int
 *   caretaker User @relation(fields: [caretakerId], references: [id])
 *   action String // CHECK_IN, SURVEY, WORK_IN_PROGRESS, etc.
 *   description String
 *   evidenceImageUrl String?
 *   actualStartTime DateTime?
 *   actualEndTime DateTime?
 *   createdAt DateTime @default(now())
 * }
 * 
 * model AddOnService {
 *   id Int @id @default(autoincrement())
 *   serviceRegistrationId Int
 *   registration ServiceRegistration @relation(fields: [serviceRegistrationId], references: [id])
 *   name String
 *   description String
 *   price Float
 *   quantity Int
 *   status String // PROPOSED, APPROVED, REJECTED
 *   approvedBy Int?
 *   approvedByUser User? @relation(fields: [approvedBy], references: [id])
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 * }
 * 
 * model ServiceInvoice {
 *   id Int @id @default(autoincrement())
 *   serviceRegistrationId Int @unique
 *   registration ServiceRegistration @relation(fields: [serviceRegistrationId], references: [id])
 *   baseAmount Float
 *   addOnAmount Float
 *   totalAmount Float
 *   status String // DRAFT, ISSUED, PAID, CANCELLED
 *   invoiceDate DateTime
 *   dueDate DateTime?
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 * }
 */

export default {};
