<div className="max-w-xl mx-auto p-3 space-y-3">

      {/* Service Header */}
      <div className="bg-white rounded-lg shadow border p-3 text-sm">
        <div className="flex justify-between items-center">
          <p className="font-semibold">
            Service ID# <span className="text-gray-700">{service.serviceId}</span>
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
            Completed
          </span>

          <div className="flex items-center gap-1 text-xs">
            <CreditCard size={14} className="text-green-600" />
            COD: ৳ {service.codAmount}
          </div>

          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
            Paid
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs mt-2">
          <Calendar size={14} />
          Service Date : {service.serviceDate}
        </div>
      </div>

      {/* Warranty */}
      <div className="bg-white border rounded-lg p-3 text-sm">
        <div className="flex justify-between items-center">
          <p className="font-semibold flex items-center gap-1">
            <ShieldCheck size={16} className="text-indigo-500" />
            Warranty
          </p>

          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
            Expired
          </span>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white border rounded-lg p-3 text-sm">
        <p className="font-semibold mb-2">Customer Information</p>

        <div className="space-y-1 text-gray-700 text-xs">

          <p className="flex items-center gap-2">
            <User size={14} className="text-blue-500" />
            {service.customerName}
          </p>

          <p className="flex items-center gap-2">
            <Phone size={14} className="text-green-500" />
            {service.customerPhone}
          </p>

          <p className="flex items-center gap-2">
            <Settings size={14} className="text-purple-500" />
            Product : {service.productModel}
          </p>

          <p className="flex items-center gap-2">
            <MapPin size={14} className="text-red-500" />
            {service.customerAddress}
          </p>
        </div>
      </div>

      {/* Technician */}
      {service.appointedStaff && (
        <div className="bg-white border rounded-lg p-3 text-sm">
          <p className="font-semibold mb-2">Technician Information</p>

          <div className="space-y-1 text-xs text-gray-700">
            <p className="flex items-center gap-2">
              <User size={14} className="text-indigo-500" />
              {service.appointedStaff.name}
            </p>

            <p className="flex items-center gap-2">
              <Phone size={14} className="text-green-500" />
              {service.appointedStaff.phone}
            </p>

            <p className="flex items-center gap-2">
              <Wrench size={14} className="text-orange-500" />
              {service.staffRole}
            </p>
          </div>
        </div>
      )}

      {/* Service Center */}
      <div className="bg-white border rounded-lg p-3 text-sm">
        <p className="font-semibold mb-2">Current Servicing Center</p>

        <div className="text-xs text-gray-700 space-y-1">
          <p className="flex items-center gap-2">
            <MapPin size={14} className="text-red-500" />
            {service.customerAddress}
          </p>

          <p className="flex items-center gap-2">
            <Phone size={14} className="text-green-500" />
            Call : {service.customerPhone}
          </p>
        </div>
      </div>

      {/* Ongoing */}
      <div className="bg-white border rounded-lg p-3 text-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-red-500">⚠ Ongoing</p>

          <button className="text-xs bg-black text-white px-2 py-1 rounded">
            New Complain
          </button>
        </div>

        <div className="text-xs text-gray-700 space-y-1">
          <p>
            Complaining ID# :{" "}
            <span className="font-semibold">{service.serviceId}</span>
          </p>

          <p>IPS Service</p>

          <p className="flex items-center gap-2">
            <User size={14} />
            {service.appointedStaff?.name}
          </p>

          <p className="flex items-center gap-2">
            <Calendar size={14} />
            {service.serviceDate}
          </p>
        </div>
      </div>
    </div>