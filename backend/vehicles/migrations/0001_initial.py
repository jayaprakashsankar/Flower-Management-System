from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Vehicle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('tractor', 'Tractor'), ('truck', 'Truck'), ('mini_van', 'Mini Van'), ('tempo', 'Tempo'), ('jcb', 'JCB'), ('lorry', 'Lorry'), ('two_wheeler', 'Two Wheeler')], max_length=20)),
                ('reg_number', models.CharField(max_length=20, unique=True)),
                ('model', models.CharField(blank=True, max_length=100)),
                ('capacity_kg', models.PositiveIntegerField(default=500)),
                ('is_available', models.BooleanField(default=True)),
                ('rate_per_km', models.DecimalField(decimal_places=2, default=12, max_digits=8)),
                ('base_charge', models.DecimalField(decimal_places=2, default=300, max_digits=8)),
                ('insurance_expiry', models.DateField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehicles', to='auth.user')),
            ],
        ),
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('pricing_type', models.CharField(choices=[('time', 'Per Hour'), ('count', 'Per Unit Count')], default='time', max_length=10)),
                ('rate', models.DecimalField(decimal_places=2, max_digits=10)),
                ('is_available', models.BooleanField(default=True)),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='EMI',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lender', models.CharField(blank=True, max_length=200)),
                ('total_loan', models.DecimalField(decimal_places=2, max_digits=12)),
                ('amount_paid', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('emi_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('due_date', models.DateField()),
                ('status', models.CharField(choices=[('active', 'Active'), ('overdue', 'Overdue'), ('paid', 'Fully Paid')], default='active', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='emis', to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='Driver',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('license_no', models.CharField(blank=True, max_length=50)),
                ('license_expiry', models.DateField(blank=True, null=True)),
                ('phone', models.CharField(blank=True, max_length=15)),
                ('photo', models.ImageField(blank=True, null=True, upload_to='drivers/')),
                ('is_on_duty', models.BooleanField(default=False)),
                ('live_tracking_enabled', models.BooleanField(default=True)),
                ('upi_id', models.CharField(blank=True, max_length=100)),
                ('whatsapp', models.CharField(blank=True, max_length=15)),
                ('current_lat', models.FloatField(blank=True, null=True)),
                ('current_lng', models.FloatField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='driver_profile', to='auth.user')),
                ('vehicle', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='drivers', to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='WorkOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customer_name', models.CharField(max_length=200)),
                ('customer_phone', models.CharField(blank=True, max_length=15)),
                ('from_location', models.CharField(max_length=300)),
                ('to_location', models.CharField(max_length=300)),
                ('job_lat', models.FloatField(blank=True, null=True)),
                ('job_lng', models.FloatField(blank=True, null=True)),
                ('cargo_desc', models.CharField(blank=True, max_length=300)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined'), ('in_progress', 'In Progress'), ('completed', 'Completed')], default='pending', max_length=15)),
                ('scheduled_date', models.DateField()),
                ('total_cost', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('payment_status', models.CharField(default='pending', max_length=20)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('attachment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='vehicles.attachment')),
                ('driver', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='work_orders', to='vehicles.driver')),
                ('vehicle', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField(blank=True, null=True)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('break_duration_mins', models.PositiveIntegerField(default=0)),
                ('unit_count', models.PositiveIntegerField(default=0)),
                ('total_cost', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('distance_km', models.FloatField(blank=True, null=True)),
                ('route_polyline', models.TextField(blank=True)),
                ('work_order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='trip', to='vehicles.workorder')),
            ],
        ),
        migrations.CreateModel(
            name='MaintenanceLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('log_type', models.CharField(choices=[('oil_change', 'Oil Change'), ('fuel', 'Fuel'), ('repair', 'Repair/Part'), ('other', 'Other')], max_length=15)),
                ('description', models.CharField(max_length=300)),
                ('cost', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('odometer_km', models.PositiveIntegerField(blank=True, null=True)),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='maintenance_logs', to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('farmer', 'Farmer'), ('agent', 'Agent'), ('store', 'Store Owner'), ('vehicle_owner', 'Vehicle Owner'), ('driver', 'Driver')], max_length=15)),
                ('tx_type', models.CharField(choices=[('income', 'Income'), ('expense', 'Expense')], max_length=10)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('description', models.CharField(max_length=300)),
                ('ref_id', models.CharField(blank=True, max_length=50)),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='auth.user')),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('review_type', models.CharField(choices=[('product_quality', 'Product Quality'), ('provider_service', 'Provider/Service'), ('delivery', 'Delivery Punctuality')], max_length=20)),
                ('rating', models.PositiveSmallIntegerField()),
                ('comment', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_public', models.BooleanField(default=True)),
                ('reviewer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='given_reviews', to='auth.user')),
                ('target_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_reviews', to='auth.user')),
                ('work_order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='vehicles.workorder')),
            ],
            options={
                'unique_together': {('reviewer', 'target_user', 'work_order', 'review_type')},
            },
        ),
        migrations.CreateModel(
            name='NearbyHelpRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lat', models.FloatField()),
                ('lng', models.FloatField()),
                ('description', models.TextField()),
                ('status', models.CharField(choices=[('open', 'Open'), ('responded', 'Responded'), ('closed', 'Closed')], default='open', max_length=15)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('requester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.user')),
                ('vehicle', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='vehicles.vehicle')),
            ],
        ),
    ]
